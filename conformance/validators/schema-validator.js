/**
 * ICGLR Schema Validator
 * Validates JSON data against ICGLR JSON schemas
 * 
 * Usage:
 *   const validator = require('./schema-validator');
 *   const result = validator.validate(data, 'mining-operation');
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

class ICGLRValidator {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateSchema: true,
      verbose: true
    });
    
    addFormats(this.ajv);
    
    // Load all schemas
    this.schemas = {};
    this.loadSchemas();
  }

  loadSchemas() {
    const schemasDir = path.join(__dirname, '../../schemas');
    const loadedIds = new Set();
    
    // Load common schema first
    const commonPath = path.join(schemasDir, 'core/common.json');
    if (fs.existsSync(commonPath)) {
      const commonSchema = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
      if (commonSchema.$id) {
        this.ajv.addSchema(commonSchema, commonSchema.$id);
        loadedIds.add(commonSchema.$id);
      }
    }
    
    // Load other schemas
    this.loadSchemaRecursive(schemasDir, loadedIds);
  }

  loadSchemaRecursive(dir, loadedIds, baseDir = null) {
    if (!baseDir) {
      baseDir = dir;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other non-schema directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          this.loadSchemaRecursive(fullPath, loadedIds, baseDir);
        }
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Skip common.json as it's already loaded
        if (entry.name === 'common.json' && dir.endsWith('core')) {
          continue;
        }
        
        try {
          const schema = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (schema.$id) {
            // Check if schema ID already loaded
            if (loadedIds.has(schema.$id)) {
              console.warn(`Schema ${schema.$id} already loaded, skipping ${fullPath}`);
              continue;
            }
            
            this.ajv.addSchema(schema, schema.$id);
            loadedIds.add(schema.$id);
            
            // Create schema name mapping
            // Use relative path from schemas dir as schema name
            const relativePath = path.relative(baseDir, fullPath);
            const schemaName = relativePath.replace(/\\/g, '/').replace('.json', '').replace(/\//g, '-');
            this.schemas[schemaName] = schema.$id;
            
            // Also add just the filename as an alias (preferred name)
            const fileName = entry.name.replace('.json', '');
            this.schemas[fileName] = schema.$id;
          }
        } catch (error) {
          console.warn(`Failed to load schema ${fullPath}:`, error.message);
        }
      }
    }
  }

  validate(data, schemaName) {
    const schemaId = this.schemas[schemaName];
    
    if (!schemaId) {
      return {
        valid: false,
        errors: [{
          message: `Schema '${schemaName}' not found`,
          schemaPath: ''
        }]
      };
    }

    const validate = this.ajv.getSchema(schemaId);
    
    if (!validate) {
      return {
        valid: false,
        errors: [{
          message: `Validator for schema '${schemaName}' not found`,
          schemaPath: ''
        }]
      };
    }

    const valid = validate(data);
    
    return {
      valid,
      errors: validate.errors || []
    };
  }

  validateMultiple(dataArray, schemaName) {
    const results = dataArray.map((data, index) => {
      const result = this.validate(data, schemaName);
      return {
        index,
        ...result
      };
    });

    return {
      total: dataArray.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      results
    };
  }

  getSchema(schemaName) {
    const schemaId = this.schemas[schemaName];
    if (!schemaId) {
      return null;
    }
    return this.ajv.getSchema(schemaId);
  }

  listSchemas() {
    return Object.keys(this.schemas);
  }
}

// Export singleton instance
const validator = new ICGLRValidator();

module.exports = validator;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node schema-validator.js <schema-name> <json-file>');
    console.log('\nAvailable schemas:');
    const schemas = validator.listSchemas().sort();
    schemas.forEach(schema => {
      console.log(`  - ${schema}`);
    });
    console.log('\nExamples:');
    console.log('  node schema-validator.js mine-site examples/json/mine-site-example.json');
    console.log('  node schema-validator.js export-certificate examples/json/export-certificate-example.json');
    console.log('  node schema-validator.js lot examples/json/lot-example.json');
    process.exit(1);
  }

  const [schemaName, jsonFile] = args;
  
  if (!fs.existsSync(jsonFile)) {
    console.error(`✗ Error: File not found: ${jsonFile}`);
    process.exit(1);
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const result = validator.validate(data, schemaName);

    if (result.valid) {
      console.log('✓ Validation passed');
      process.exit(0);
    } else {
      console.error('✗ Validation failed:');
      console.error(JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`✗ Error: Invalid JSON in ${jsonFile}`);
      console.error(error.message);
    } else {
      console.error(`✗ Error: ${error.message}`);
    }
    process.exit(1);
  }
}


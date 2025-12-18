/**
 * JSON Schema to SQL DDL Generator
 * Uses json-schema-to-sql package to automatically generate SQLite DDL from JSON schemas
 */

const fs = require('fs');
const path = require('path');

// Note: json-schema-to-sql is an ES module, so we use dynamic import if needed
// For now, we use custom implementation which works better with our schema structure
let generateSQLFromJSONSchema = null;

class JsonSchemaToSql {
  constructor(schemasDir) {
    this.schemasDir = schemasDir;
    this.schemas = {};
    this.tables = [];
  }

  // Load all schemas
  loadSchemas() {
    this.loadSchemaRecursive(this.schemasDir);
  }

  loadSchemaRecursive(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        this.loadSchemaRecursive(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const schema = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (schema.$id) {
            this.schemas[schema.$id] = schema;
            // Also store by relative path
            const relativePath = path.relative(this.schemasDir, fullPath).replace(/\\/g, '/');
            this.schemas[relativePath] = schema;
          }
        } catch (error) {
          console.warn(`Failed to load schema ${fullPath}:`, error.message);
        }
      }
    }
  }

  // Generate SQL DDL - uses package if available, otherwise custom implementation
  generateDDL(schema, tableName) {
    if (!schema || !schema.properties) {
      return null;
    }

    // If package is available, use it
    if (generateSQLFromJSONSchema) {
      try {
        // Prepare schema for json-schema-to-sql
        // The package expects a specific format
        const preparedSchema = this.prepareSchemaForPackage(schema, tableName);
        const result = generateSQLFromJSONSchema(preparedSchema);
        
        // Extract SQL from result
        let sql = '';
        if (typeof result === 'string') {
          sql = result;
        } else if (result && result.queries) {
          sql = result.queries.join(';\n') + ';';
        } else if (result && result.sql) {
          sql = result.sql;
        }

        return {
          tableName,
          sql: sql || this.generateCustomDDL(schema, tableName)
        };
      } catch (error) {
        console.warn(`Package generation failed for ${tableName}, using custom:`, error.message);
        return {
          tableName,
          sql: this.generateCustomDDL(schema, tableName)
        };
      }
    }

    // Fallback to custom implementation
    return {
      tableName,
      sql: this.generateCustomDDL(schema, tableName)
    };
  }

  // Prepare schema for json-schema-to-sql package format
  prepareSchemaForPackage(schema, tableName) {
    // The package may expect a specific format
    // Adjust based on actual package API
    return {
      type: 'object',
      properties: {
        [tableName]: schema
      }
    };
  }

  // Resolve schema reference to get actual definition
  resolveSchemaDefinition(schema, schemas) {
    if (schema.$ref) {
      const [schemaPath, jsonPath] = schema.$ref.split('#');
      
      // Try to find the schema
      let targetSchema = schemas[schemaPath];
      if (!targetSchema) {
        // Try relative path
        const schemaFileName = schemaPath.split('/').pop();
        targetSchema = Object.values(schemas).find(s => 
          s && (s.$id && s.$id.includes(schemaFileName)) ||
          (typeof s === 'object' && s.definitions)
        );
      }
      
      // If still not found, try common schema
      if (!targetSchema) {
        const commonSchema = Object.values(schemas).find(s => 
          s && s.$id && s.$id.includes('core/common')
        );
        if (commonSchema && commonSchema.definitions) {
          targetSchema = commonSchema;
        }
      }
      
      if (targetSchema && jsonPath) {
        const pathParts = jsonPath.split('/').filter(p => p && p !== '#');
        let result = targetSchema;
        for (const part of pathParts) {
          if (result && result[part]) {
            result = result[part];
          } else if (result && result.definitions && result.definitions[part]) {
            result = result.definitions[part];
          } else {
            return null;
          }
        }
        return result;
      }
      return targetSchema;
    }
    return schema;
  }

  // Check if a property should be a reference (foreign key) instead of flattened
  shouldBeReference(propName, resolvedSchema, commonSchema) {
    if (!resolvedSchema || resolvedSchema.type !== 'object' || !resolvedSchema.properties) {
      return false;
    }

    if (!commonSchema || !commonSchema.definitions) {
      return false;
    }

    // Check against known entity definitions
    const entityDefinitions = {
      'Address': commonSchema.definitions.Address,
      'BusinessEntity': commonSchema.definitions.BusinessEntity,
      'ContactDetails': commonSchema.definitions.ContactDetails,
      'Geolocalization': commonSchema.definitions.Geolocalization
    };

    // Check if resolved schema matches any entity definition by structure
    for (const [entityName, entityDef] of Object.entries(entityDefinitions)) {
      if (!entityDef || !entityDef.properties) continue;

      const entityProps = Object.keys(entityDef.properties);
      const resolvedProps = Object.keys(resolvedSchema.properties || {});
      
      // If properties match entity definition, it's a reference
      if (entityProps.length > 0 && 
          entityProps.length === resolvedProps.length &&
          entityProps.every(prop => resolvedProps.includes(prop))) {
        return {
          isReference: true,
          entityName: entityName.toLowerCase(),
          tableName: this.getTableNameForEntity(entityName)
        };
      }
    }

    // Also check by property name patterns (for $ref cases)
    if (propName === 'legal_address' || propName === 'physical_address' || 
        propName.endsWith('_address') || (propName.includes('address') && !propName.includes('_id'))) {
      if (entityDefinitions.Address) {
        return {
          isReference: true,
          entityName: 'address',
          tableName: 'addresses'
        };
      }
    }

    if (propName === 'contact_details' || propName.endsWith('_contact_details')) {
      if (entityDefinitions.ContactDetails) {
        return {
          isReference: true,
          entityName: 'contactdetails',
          tableName: 'contact_details'
        };
      }
    }

    if (propName === 'geolocalization' || propName.endsWith('_geolocalization')) {
      if (entityDefinitions.Geolocalization) {
        return {
          isReference: true,
          entityName: 'geolocalization',
          tableName: 'geolocalizations'
        };
      }
    }

    // Check local_geographic_designation (it's an Address)
    if (propName === 'local_geographic_designation' || propName.endsWith('_local_geographic_designation')) {
      if (entityDefinitions.Address) {
        return {
          isReference: true,
          entityName: 'address',
          tableName: 'addresses'
        };
      }
    }

    return false;
  }

  getTableNameForEntity(entityName) {
    const tableNames = {
      'address': 'addresses',
      'businessentity': 'business_entities',
      'contactdetails': 'contact_details',
      'geolocalization': 'geolocalizations',
      'minesitelocation': 'mine_site_locations'
    };
    return tableNames[entityName.toLowerCase()] || this.snakeCase(entityName) + 's';
  }

  // Flatten nested object properties into columns
  flattenProperties(properties, prefix = '', required = [], schemas = {}, isAddressReference = false) {
    const columns = [];
    
    // Get common schema for definitions
    let commonSchema = null;
    for (const [key, s] of Object.entries(schemas)) {
      if (key.includes('core/common') || (s && s.$id && s.$id.includes('core/common'))) {
        commonSchema = s;
        break;
      } else if (s && s.definitions) {
        commonSchema = s;
      }
    }
    
    // Add common definitions to schemas lookup
    const allSchemas = { ...schemas };
    if (commonSchema && commonSchema.definitions) {
      allSchemas['common'] = commonSchema;
      // Also add definitions directly
      for (const [defName, defSchema] of Object.entries(commonSchema.definitions)) {
        allSchemas[`#/definitions/${defName}`] = defSchema;
      }
    }
    
    for (const [propName, propSchema] of Object.entries(properties || {})) {
      const fullPropName = prefix ? `${prefix}_${propName}` : propName;
      const isRequired = required.includes(propName);
      
      // Resolve $ref if present
      let resolvedSchema = propSchema;
      if (propSchema && propSchema.$ref) {
        // Handle local references (#/definitions/...)
        if (propSchema.$ref.startsWith('#/')) {
          const refPath = propSchema.$ref.split('#/').pop();
          if (commonSchema && commonSchema.definitions) {
            const pathParts = refPath.split('/').filter(p => p);
            let result = commonSchema;
            for (const part of pathParts) {
              if (result && result.definitions && result.definitions[part]) {
                result = result.definitions[part];
              } else if (result && result[part]) {
                result = result[part];
              } else {
                result = null;
                break;
              }
            }
            if (result) {
              resolvedSchema = result;
            }
          }
        } else {
          // Handle external references
          resolvedSchema = this.resolveSchemaDefinition(propSchema, allSchemas) || propSchema;
        }
      }
      
      // Check if this should be a reference to another entity table
      const referenceInfo = this.shouldBeReference(propName, resolvedSchema, commonSchema);
      if (referenceInfo && referenceInfo.isReference) {
        // Create foreign key reference instead of flattening
        const refColumnName = this.snakeCase(fullPropName) + '_id';
        columns.push({
          name: refColumnName,
          type: 'INTEGER',
          required: isRequired,
          isReference: true,
          referenceTable: referenceInfo.tableName,
          entityName: referenceInfo.entityName
        });
      } else if (resolvedSchema && resolvedSchema.type === 'object' && resolvedSchema.properties) {
        // Check if this nested object matches any entity definition
        const nestedRefInfo = this.shouldBeReference('', resolvedSchema, commonSchema);
        if (nestedRefInfo && nestedRefInfo.isReference) {
          // Create foreign key reference for nested entity
          const refColumnName = this.snakeCase(fullPropName) + '_id';
          columns.push({
            name: refColumnName,
            type: 'INTEGER',
            required: isRequired,
            isReference: true,
            referenceTable: nestedRefInfo.tableName,
            entityName: nestedRefInfo.entityName
          });
        } else {
          // Recursively flatten nested objects (but not entities)
          const nestedRequired = resolvedSchema.required || [];
          const nested = this.flattenProperties(resolvedSchema.properties, fullPropName, nestedRequired, allSchemas);
          columns.push(...nested);
        }
      } else if (resolvedSchema && resolvedSchema.type) {
        const sqlType = this.getSqlType(resolvedSchema, fullPropName);
        if (sqlType) {
          columns.push({
            name: this.snakeCase(fullPropName),
            type: sqlType,
            required: isRequired
          });
        }
      }
    }
    
    return columns;
  }

  // Custom DDL generation (fallback)
  generateCustomDDL(schema, tableName) {
    const columns = [];
    const foreignKeys = [];
    const primaryKey = this.getPrimaryKey(tableName);
    
    // Find common schema for resolving definitions
    let commonSchema = null;
    for (const [key, s] of Object.entries(this.schemas)) {
      if (key.includes('core/common') || (s.$id && s.$id.includes('core/common'))) {
        commonSchema = s;
        break;
      }
    }
    
    // Flatten all properties including nested objects
    const flattenedColumns = this.flattenProperties(
      schema.properties, 
      '', 
      schema.required || [],
      { ...this.schemas, ...(commonSchema && commonSchema.definitions ? { 'common': commonSchema } : {}) }
    );

    for (const col of flattenedColumns) {
      const isPrimaryKey = primaryKey === col.name || 
                         (Array.isArray(primaryKey) && primaryKey.includes(col.name));
      
      let columnDef = `${col.name} ${col.type}`;
      
      // Don't add PRIMARY KEY here for composite keys - handle separately
      if (isPrimaryKey && !Array.isArray(primaryKey)) {
        columnDef += ' PRIMARY KEY';
      } else if (!col.required) {
        columnDef += ' NULL';
      } else {
        columnDef += ' NOT NULL';
      }

      columns.push(columnDef);

      // Track foreign keys
      if (col.isReference && col.referenceTable) {
        // Entity reference (Address, BusinessEntity, ContactDetails, Geolocalization, etc.)
        // Use correct primary key for each table
        const refColumn = col.referenceTable === 'business_entities' ? 'identifier' : 'id';
        foreignKeys.push(`FOREIGN KEY (${col.name}) REFERENCES ${col.referenceTable}(${refColumn})`);
      } else if (col.name.endsWith('_identifier') || (col.name.endsWith('_id') && col.name !== 'icglr_id' && !col.isReference)) {
        const refTable = this.getReferencedTable(col.name);
        if (refTable) {
          // Use correct primary key column for each table
          const refColumn = refTable === 'mine_sites' ? 'icglr_id' : 
                          refTable === 'lots' ? 'lot_number' :
                          refTable === 'tags' ? 'identifier' :
                          refTable === 'inspections' ? 'inspection_id' :
                          refTable === 'business_entities' ? 'identifier' :
                          'identifier';
          foreignKeys.push(`FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refColumn})`);
        }
      }
    }

    let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    const allColumns = [...columns];
    if (foreignKeys.length > 0) {
      allColumns.push(...foreignKeys);
    }
    
    // Handle composite primary keys
    if (Array.isArray(primaryKey)) {
      const pkColumns = primaryKey.map(pk => this.snakeCase(pk)).join(', ');
      allColumns.push(`PRIMARY KEY (${pkColumns})`);
    }
    
    sql += allColumns.map(col => `  ${col}`).join(',\n');
    sql += `\n);`;

    return sql;
  }

  getSqlType(schema, propName) {
    if (!schema || typeof schema !== 'object') {
      return 'TEXT';
    }

    if (schema.$ref) {
      // For references, default to TEXT
      return 'TEXT';
    }

    if (schema.type === 'string') {
      if (propName.includes('date') || propName.includes('Date')) {
        return 'DATE';
      } else if (propName.includes('time') || propName.includes('Time')) {
        return 'DATETIME';
      }
      return 'TEXT';
    } else if (schema.type === 'integer' || schema.type === 'number') {
      // Use REAL for coordinates (latitude/longitude)
      if (propName.includes('latitude') || propName.includes('longitude')) {
        return 'REAL';
      }
      return 'INTEGER';
    } else if (schema.type === 'boolean') {
      return 'INTEGER';
    } else if (schema.type === 'array') {
      return null; // Handled separately
    } else if (schema.type === 'object') {
      // For nested objects, we flatten them, so return null here
      // The flattening will handle the nested properties
      return null;
    }

    return 'TEXT';
  }

  getPrimaryKey(tableName) {
    const primaryKeys = {
      'mine_sites': 'icglr_id',
      'business_entities': 'identifier',
      'lots': 'lot_number',
      'tags': 'identifier',
      'inspections': 'inspection_id',
      'export_certificates': ['identifier', 'issuing_country'],
      'licenses': 'id',
      'taxes': 'id',
      'status_history': 'id'
    };
    return primaryKeys[tableName] || null;
  }

  getReferencedTable(propName) {
    if (propName.includes('owner') || propName.includes('exporter') || 
        propName.includes('importer') || propName.includes('creator') || 
        propName.includes('recipient')) {
      return 'business_entities';
    } else if (propName.includes('mine_site')) {
      return 'mine_sites';
    } else if (propName.includes('lot') && !propName.includes('lot_number')) {
      return 'lots';
    } else if (propName.includes('export_certificate')) {
      return 'export_certificates';
    }
    return null;
  }

  snakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  // Generate all tables
  generateAllTables() {
    // Find schemas
    let mineSiteSchema = null;
    let exportCertSchema = null;
    let lotSchema = null;
    let businessEntitySchema = null;
    let commonSchema = null;
    let statusHistorySchema = null;
    let mineSiteLocationSchema = null;

    // Find common schema first
    for (const [key, schema] of Object.entries(this.schemas)) {
      if (key.includes('core/common') || (schema.$id && schema.$id.includes('core/common'))) {
        commonSchema = schema;
        if (schema.definitions && schema.definitions.BusinessEntity) {
          businessEntitySchema = schema.definitions.BusinessEntity;
        }
        break;
      }
    }
    
    // Find status history and mine site location schemas
    for (const [key, schema] of Object.entries(this.schemas)) {
      if (key.includes('status-history.json')) {
        statusHistorySchema = schema;
      } else if (key.includes('mine-site-location.json')) {
        mineSiteLocationSchema = schema;
      }
    }

    // Find other schemas
    for (const [key, schema] of Object.entries(this.schemas)) {
      if (key.includes('mine-site.json') && !key.includes('license') && 
          !key.includes('inspection') && !key.includes('location') && 
          !key.includes('status-history')) {
        mineSiteSchema = schema;
      } else if (key.includes('export-certificate.json')) {
        exportCertSchema = schema;
      } else if (key.includes('chain-of-custody/lot.json') || 
                 (key.includes('lot.json') && !key.includes('input'))) {
        lotSchema = schema;
      }
    }

    // Generate tables
    if (mineSiteSchema) {
      const result = this.generateDDL(mineSiteSchema, 'mine_sites');
      if (result) this.tables.push(result);
    }
    if (exportCertSchema) {
      const result = this.generateDDL(exportCertSchema, 'export_certificates');
      if (result) this.tables.push(result);
    }
    if (lotSchema) {
      const result = this.generateDDL(lotSchema, 'lots');
      if (result) this.tables.push(result);
    }
    if (businessEntitySchema) {
      const result = this.generateDDL(businessEntitySchema, 'business_entities');
      if (result) this.tables.push(result);
    }

    // Secondary entities
    let licenseSchema = null;
    let inspectionSchema = null;
    let tagSchema = null;
    let taxSchema = null;

    for (const [key, schema] of Object.entries(this.schemas)) {
      if (key.includes('license.json')) {
        licenseSchema = schema;
      } else if (key.includes('inspection.json')) {
        inspectionSchema = schema;
      } else if (key.includes('tag.json')) {
        tagSchema = schema;
      } else if (key.includes('tax.json')) {
        taxSchema = schema;
      }
    }

    if (licenseSchema) {
      // Add id as primary key for licenses
      const result = this.generateDDL(licenseSchema, 'licenses');
      if (result) {
        // Ensure id column exists
        if (!result.sql.includes('id INTEGER')) {
          result.sql = result.sql.replace('CREATE TABLE IF NOT EXISTS licenses (', 
            'CREATE TABLE IF NOT EXISTS licenses (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,');
        }
        this.tables.push(result);
      }
    }
    if (inspectionSchema) {
      const result = this.generateDDL(inspectionSchema, 'inspections');
      if (result) this.tables.push(result);
    }
    if (tagSchema) {
      const result = this.generateDDL(tagSchema, 'tags');
      if (result) this.tables.push(result);
    }
    if (taxSchema) {
      const result = this.generateDDL(taxSchema, 'taxes');
      if (result) {
        // Ensure id column exists for taxes
        if (!result.sql.includes('id INTEGER')) {
          result.sql = result.sql.replace('CREATE TABLE IF NOT EXISTS taxes (', 
            'CREATE TABLE IF NOT EXISTS taxes (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,');
        }
        this.tables.push(result);
      }
    }
    
    // Generate status_history table (add mine_site_id column)
    if (statusHistorySchema) {
      // Add mine_site_id to the schema for foreign key relationship
      const enhancedSchema = {
        ...statusHistorySchema,
        properties: {
          ...statusHistorySchema.properties,
          mine_site_id: {
            type: 'string',
            description: 'Reference to mine site ICGLR ID'
          }
        },
        required: [...(statusHistorySchema.required || []), 'mine_site_id']
      };
      const result = this.generateDDL(enhancedSchema, 'status_history');
      if (result) {
        // Ensure id column exists
        if (!result.sql.includes('id INTEGER')) {
          result.sql = result.sql.replace('CREATE TABLE IF NOT EXISTS status_history (', 
            'CREATE TABLE IF NOT EXISTS status_history (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,');
        }
        this.tables.push(result);
      }
    }
  }

  // Generate entity tables from common definitions
  generateEntityTables() {
    const tables = [];
    
    // Find common schema
    let commonSchema = null;
    for (const [key, schema] of Object.entries(this.schemas)) {
      if (key.includes('core/common') || (schema.$id && schema.$id.includes('core/common'))) {
        commonSchema = schema;
        break;
      }
    }

    if (!commonSchema || !commonSchema.definitions) {
      return tables;
    }

    // Generate Address table
    if (commonSchema.definitions.Address) {
      const addressTable = this.generateTableFromDefinition(
        commonSchema.definitions.Address,
        'addresses'
      );
      if (addressTable) tables.push(addressTable);
    }

    // Generate ContactDetails table
    if (commonSchema.definitions.ContactDetails) {
      const contactTable = this.generateTableFromDefinition(
        commonSchema.definitions.ContactDetails,
        'contact_details'
      );
      if (contactTable) tables.push(contactTable);
    }

    // Generate Geolocalization table
    if (commonSchema.definitions.Geolocalization) {
      const geoTable = this.generateTableFromDefinition(
        commonSchema.definitions.Geolocalization,
        'geolocalizations'
      );
      if (geoTable) tables.push(geoTable);
    }

    // Generate MineSiteLocation table (from mine-site-location.json)
    // Note: MineSiteLocation contains geolocalization and address references
    for (const [key, schema] of Object.entries(this.schemas)) {
      if (key.includes('mine-site-location.json')) {
        // MineSiteLocation has geolocalization and local_geographic_designation as references
        const locationTable = this.generateTableFromDefinition(schema, 'mine_site_locations', true);
        if (locationTable) tables.push(locationTable);
        break;
      }
    }

    return tables;
  }

  // Generate table from a definition schema
  generateTableFromDefinition(schema, tableName, handleReferences = false) {
    if (!schema || !schema.properties) {
      return null;
    }

    const columns = [];
    const foreignKeys = [];
    
    // Get common schema for reference checking
    let commonSchema = null;
    for (const [key, s] of Object.entries(this.schemas)) {
      if (key.includes('core/common') || (s.$id && s.$id.includes('core/common'))) {
        commonSchema = s;
        break;
      }
    }
    
    // Flatten properties (handle references if needed)
    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      // Resolve $ref
      let resolvedSchema = propSchema;
      if (propSchema && propSchema.$ref) {
        if (propSchema.$ref.startsWith('#/')) {
          const refPath = propSchema.$ref.split('#/').pop();
          if (commonSchema && commonSchema.definitions) {
            const pathParts = refPath.split('/').filter(p => p);
            let result = commonSchema;
            for (const part of pathParts) {
              if (result && result.definitions && result.definitions[part]) {
                result = result.definitions[part];
              } else {
                result = null;
                break;
              }
            }
            if (result) {
              resolvedSchema = result;
            }
          }
        } else {
          // Handle external references (e.g., ../core/common.json#/definitions/...)
          resolvedSchema = this.resolveSchemaDefinition(propSchema, this.schemas) || propSchema;
        }
      }

      // Check if this should be a reference (always check for entity tables)
      const refInfo = this.shouldBeReference(propName, resolvedSchema, commonSchema);
      if (refInfo && refInfo.isReference) {
        const refColumnName = this.snakeCase(propName) + '_id';
        const isRequired = schema.required && schema.required.includes(propName);
        const refColumn = refInfo.tableName === 'business_entities' ? 'identifier' : 'id';
        columns.push(`${refColumnName} INTEGER ${isRequired ? 'NOT NULL' : 'NULL'}`);
        foreignKeys.push(`FOREIGN KEY (${refColumnName}) REFERENCES ${refInfo.tableName}(${refColumn})`);
        continue;
      }

      const sqlType = this.getSqlType(resolvedSchema, propName);
      if (!sqlType) continue;

      const isRequired = schema.required && schema.required.includes(propName);
      
      let columnDef = `${this.snakeCase(propName)} ${sqlType}`;
      
      if (!isRequired) {
        columnDef += ' NULL';
      } else {
        columnDef += ' NOT NULL';
      }

      columns.push(columnDef);
    }

    // Add id as primary key
    columns.unshift('id INTEGER PRIMARY KEY AUTOINCREMENT');
    
    // Add foreign keys
    if (foreignKeys.length > 0) {
      columns.push(...foreignKeys);
    }

    let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    sql += columns.map(col => `  ${col}`).join(',\n');
    sql += `\n);`;

    return {
      tableName,
      sql
    };
  }

  // Generate complete SQL
  generateSQL() {
    let sql = `-- ICGLR Mining Sector Data Sharing Protocol Database Schema
-- Auto-generated from JSON schemas using json-schema-to-sql
-- Generated: ${new Date().toISOString()}

PRAGMA foreign_keys = ON;

`;

    // Generate entity tables first (they're referenced by other tables)
    const entityTables = this.generateEntityTables();
    for (const entityTable of entityTables) {
      sql += `-- ${entityTable.tableName}\n`;
      sql += entityTable.sql;
      sql += `\n\n`;
    }

    // Generate CREATE TABLE statements in correct order
    // First: entity tables, then main tables, then secondary tables
    const tableOrder = [
      'addresses',
      'contact_details',
      'geolocalizations',
      'mine_site_locations',
      'business_entities',
      'mine_sites',
      'export_certificates',
      'lots',
      'licenses',
      'inspections',
      'tags',
      'taxes',
      'status_history'
    ];
    
    const tablesByName = {};
    for (const table of this.tables) {
      if (table && table.sql) {
        tablesByName[table.tableName] = table;
      }
    }
    
    // Generate tables in order
    for (const tableName of tableOrder) {
      if (tablesByName[tableName]) {
        sql += `-- ${tableName}\n`;
        sql += tablesByName[tableName].sql;
        sql += `\n\n`;
      }
    }
    
    // Generate any remaining tables not in the order list
    for (const table of this.tables) {
      if (table && table.sql && !tableOrder.includes(table.tableName)) {
        sql += `-- ${table.tableName}\n`;
        sql += table.sql;
        sql += `\n\n`;
      }
    }

    // Add junction tables for many-to-many relationships
    sql += `-- Junction tables for many-to-many relationships\n\n`;
    
    // Mine site minerals
    sql += `CREATE TABLE IF NOT EXISTS mine_site_minerals (
  mine_site_id TEXT NOT NULL,
  mineral_code TEXT NOT NULL,
  PRIMARY KEY (mine_site_id, mineral_code),
  FOREIGN KEY (mine_site_id) REFERENCES mine_sites(icglr_id)
);

`;

    // Lot creator roles
    sql += `CREATE TABLE IF NOT EXISTS lot_creator_roles (
  lot_number TEXT NOT NULL,
  role_code INTEGER NOT NULL CHECK(role_code BETWEEN 1 AND 8),
  PRIMARY KEY (lot_number, role_code),
  FOREIGN KEY (lot_number) REFERENCES lots(lot_number)
);

`;

    // Lot originating operations
    sql += `CREATE TABLE IF NOT EXISTS lot_originating_operations (
  lot_number TEXT NOT NULL,
  operation_code INTEGER NOT NULL CHECK(operation_code BETWEEN 1 AND 8),
  PRIMARY KEY (lot_number, operation_code),
  FOREIGN KEY (lot_number) REFERENCES lots(lot_number)
);

`;

    // Lot input lots (recursive)
    sql += `CREATE TABLE IF NOT EXISTS lot_input_lots (
  lot_number TEXT NOT NULL,
  input_lot_number TEXT NOT NULL,
  PRIMARY KEY (lot_number, input_lot_number),
  FOREIGN KEY (lot_number) REFERENCES lots(lot_number),
  FOREIGN KEY (input_lot_number) REFERENCES lots(lot_number)
);

`;

    // Status history table (if not already generated)
    if (!tablesByName['status_history']) {
      sql += `CREATE TABLE IF NOT EXISTS status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mine_site_id TEXT NOT NULL,
  date_of_change DATE NOT NULL,
  new_status INTEGER NOT NULL CHECK(new_status IN (0, 1, 2, 3)),
  FOREIGN KEY (mine_site_id) REFERENCES mine_sites(icglr_id)
);

CREATE INDEX IF NOT EXISTS idx_status_history_mine_site_id ON status_history(mine_site_id);
CREATE INDEX IF NOT EXISTS idx_status_history_date_of_change ON status_history(date_of_change);

`;
    }

    // License commodities junction table
    sql += `CREATE TABLE IF NOT EXISTS license_commodities (
  license_id INTEGER NOT NULL,
  mineral_code TEXT NOT NULL,
  PRIMARY KEY (license_id, mineral_code),
  FOREIGN KEY (license_id) REFERENCES licenses(id)
);

`;

    // Lot tags junction table
    sql += `CREATE TABLE IF NOT EXISTS lot_tags (
  lot_number TEXT NOT NULL,
  tag_identifier TEXT NOT NULL,
  PRIMARY KEY (lot_number, tag_identifier),
  FOREIGN KEY (lot_number) REFERENCES lots(lot_number),
  FOREIGN KEY (tag_identifier) REFERENCES tags(identifier)
);

`;

    // Lot taxes junction table
    sql += `CREATE TABLE IF NOT EXISTS lot_taxes (
  lot_number TEXT NOT NULL,
  tax_id INTEGER NOT NULL,
  PRIMARY KEY (lot_number, tax_id),
  FOREIGN KEY (lot_number) REFERENCES lots(lot_number),
  FOREIGN KEY (tax_id) REFERENCES taxes(id)
);

`;

    return sql;
  }
}

module.exports = JsonSchemaToSql;

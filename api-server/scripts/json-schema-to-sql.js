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

    if (propName === 'legalAddress' || propName === 'physicalAddress' || 
        propName.endsWith('Address') ||
        (propName.includes('address') && !propName.includes('Id'))) {
      if (entityDefinitions.Address) {
        return {
          isReference: true,
          entityName: 'address',
          tableName: 'addresses'
        };
      }
    }

    if (propName === 'contactDetails' ||  
        propName.endsWith('ContactDetails')) {
      if (entityDefinitions.ContactDetails) {
        return {
          isReference: true,
          entityName: 'contactdetails',
          tableName: 'contactDetails'
        };
      }
    }

    if (propName === 'geolocalization' || propName.endsWith('Geolocalization')) {
      if (entityDefinitions.Geolocalization) {
        return {
          isReference: true,
          entityName: 'geolocalization',
          tableName: 'geolocalizations'
        };
      }
    }

    if (propName === 'localGeographicDesignation' ||
        propName.endsWith('LocalGeographicDesignation')) {
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
      'businessentity': 'businessEntities',
      'contactdetails': 'contactDetails',
      'geolocalization': 'geolocalizations',
      'minesitelocation': 'mineSiteLocations'
    };
    // Convert entity name to camelCase table name
    const camelName = this.camelCase(entityName);
    return tableNames[entityName.toLowerCase()] || camelName.charAt(0).toLowerCase() + camelName.slice(1) + 's';
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
        const refColumnName = this.camelCase(fullPropName) + 'Id';
        const refType = referenceInfo.tableName === 'businessEntities' ? 'TEXT' : 'INTEGER';
        columns.push({
          name: refColumnName,
          type: refType,
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
          const refColumnName = this.camelCase(fullPropName) + 'Id';
          const refType = nestedRefInfo.tableName === 'businessEntities' ? 'TEXT' : 'INTEGER';
          columns.push({
            name: refColumnName,
            type: refType,
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
            name: this.camelCase(fullPropName),
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
        const refColumn =
          col.referenceTable === 'businessEntities' ? 'identifier' :
          col.referenceTable === 'mineSites' ? 'icglrId' :
          col.referenceTable === 'lots' ? 'lotNumber' :
          col.referenceTable === 'tags' ? 'identifier' :
          col.referenceTable === 'inspections' ? 'inspectionId' :
          col.referenceTable === 'exportCertificates' ? 'exportCertificateId' :
          'id';
        foreignKeys.push(`FOREIGN KEY (${col.name}) REFERENCES ${col.referenceTable}(${refColumn})`);
      } else if (col.name.endsWith('Identifier') || (col.name.endsWith('Id') && col.name !== 'icglrId' && !col.isReference)) {
        const refTable = this.getReferencedTable(col.name);
        if (refTable) {
          // Use correct primary key column for each table
          const refColumn = refTable === 'mineSites' ? 'icglrId' : 
                          refTable === 'lots' ? 'lotNumber' :
                          refTable === 'tags' ? 'identifier' :
                          refTable === 'inspections' ? 'inspectionId' :
                          refTable === 'businessEntities' ? 'identifier' :
                          refTable === 'exportCertificates' ? 'exportCertificateId' :
                          'identifier';
          foreignKeys.push(`FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refColumn})`);
        }
      }
    }

    // Special-case: exportCertificates gets a combined key column that acts as PK.
    // NOTE: Some SQLite builds disallow generated columns as PRIMARY KEY, so this is a
    // normal TEXT column populated by application code as `${issuingCountry}:${identifier}`.
    // This keeps the DB aligned with the semantic "issuingCountry + identifier" identity,
    // while allowing other tables to reference a single FK column.
    if (tableName === 'exportCertificates') {
      // Add before other columns so it appears near the top of the table definition.
      // Using ':' avoids ambiguity vs '-' if identifier contains dashes.
      columns.unshift(
        `exportCertificateId TEXT PRIMARY KEY`
      );
      // Ensure the semantic composite identity is also enforced.
      columns.push(`UNIQUE (identifier, issuingCountry)`);
    }

    let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    const allColumns = [...columns];
    if (foreignKeys.length > 0) {
      allColumns.push(...foreignKeys);
    }
    
    // Handle composite primary keys
    if (Array.isArray(primaryKey)) {
      const pkColumns = primaryKey.map(pk => this.camelCase(pk)).join(', ');
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

    // Special-case: GeoJSON polygon is modeled as an object in JSON Schema,
    // but stored as JSON text in SQLite.
    if (
      schema.type === 'object' &&
      (propName === 'polygon' || propName.endsWith('polygon') || propName.endsWith('Polygon'))
    ) {
      return 'TEXT';
    }

    if (schema.type === 'string') {
      // Prefer explicit JSON Schema formats when present
      if (schema.format === 'date') {
        return 'DATE';
      }
      if (schema.format === 'date-time') {
        return 'DATETIME';
      }

      // Our Time primitive is hhmmss (no schema.format), so store as TEXT
      // (do NOT store as DATETIME because it is not an ISO datetime).
      if (propName.includes('time') || propName.includes('Time')) {
        return 'TEXT';
      }

      // Heuristic fallback for date-like fields that don't have schema.format
      if (propName.includes('date') || propName.includes('Date')) {
        return 'DATE';
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
      // Arrays are generally handled via junction tables / separate tables in this project.
      return null;
    } else if (schema.type === 'object') {
      // For nested objects, we flatten them, so return null here
      // The flattening will handle the nested properties
      return null;
    }

    return 'TEXT';
  }

  getPrimaryKey(tableName) {
    const primaryKeys = {
      'mineSites': 'icglrId',
      'businessEntities': 'identifier',
      'lots': 'lotNumber',
      'tags': 'identifier',
      'inspections': 'inspectionId',
      // Export Certificates are uniquely identified by (issuingCountry, identifier).
      // For DB-level FK simplicity, we expose a generated combined key exportCertificateId
      // and use that as the primary key.
      'exportCertificates': 'exportCertificateId',
      'licenses': 'id',
      'taxes': 'id',
      'statusHistory': 'id'
    };
    return primaryKeys[tableName] || null;
  }

  getReferencedTable(propName) {
    if (propName.includes('owner') || propName.includes('exporter') || 
        propName.includes('importer') || propName.includes('creator') || 
        propName.includes('recipient')) {
      return 'businessEntities';
    } else if (propName.includes('mineSite')) {
      return 'mineSites';
    } else if (propName.includes('lot') && !propName.includes('lotNumber')) {
      return 'lots';
    } else if (propName.includes('exportCertificate')) {
      return 'exportCertificates';
    }
    return null;
  }

  // Keep camelCase as-is (no conversion needed since schemas already use camelCase)
  camelCase(str) {
    // If already camelCase, return as-is
    // If snake_case, convert to camelCase
    if (str.includes('_')) {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    return str;
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
      const result = this.generateDDL(mineSiteSchema, 'mineSites');
      if (result) this.tables.push(result);
    }
    if (exportCertSchema) {
      const result = this.generateDDL(exportCertSchema, 'exportCertificates');
      if (result) this.tables.push(result);
    }
    if (lotSchema) {
      const result = this.generateDDL(lotSchema, 'lots');
      if (result) this.tables.push(result);
    }
    if (businessEntitySchema) {
      const result = this.generateDDL(businessEntitySchema, 'businessEntities');
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
    
    // Generate statusHistory table (add mineSiteId column)
    if (statusHistorySchema) {
      // Add mineSiteId to the schema for foreign key relationship
      const enhancedSchema = {
        ...statusHistorySchema,
        properties: {
          ...statusHistorySchema.properties,
          mineSiteId: {
            type: 'string',
            description: 'Reference to mine site ICGLR ID'
          }
        },
        required: [...(statusHistorySchema.required || []), 'mineSiteId']
      };
      const result = this.generateDDL(enhancedSchema, 'statusHistory');
      if (result) {
        // Ensure id column exists
        if (!result.sql.includes('id INTEGER')) {
          result.sql = result.sql.replace('CREATE TABLE IF NOT EXISTS statusHistory (', 
            'CREATE TABLE IF NOT EXISTS statusHistory (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,');
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
        'contactDetails'
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
        // MineSiteLocation has geolocalization and localGeographicDesignation as references
        const locationTable = this.generateTableFromDefinition(schema, 'mineSiteLocations', true);
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
        const refColumnName = this.camelCase(propName) + 'Id';
        const isRequired = schema.required && schema.required.includes(propName);
        const refColumn = refInfo.tableName === 'businessEntities' ? 'identifier' : 'id';
        const refType = refInfo.tableName === 'businessEntities' ? 'TEXT' : 'INTEGER';
        columns.push(`${refColumnName} ${refType} ${isRequired ? 'NOT NULL' : 'NULL'}`);
        foreignKeys.push(`FOREIGN KEY (${refColumnName}) REFERENCES ${refInfo.tableName}(${refColumn})`);
        continue;
      }

      const sqlType = this.getSqlType(resolvedSchema, propName);
      if (!sqlType) continue;

      const isRequired = schema.required && schema.required.includes(propName);
      
      let columnDef = `${this.camelCase(propName)} ${sqlType}`;
      
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
      'contactDetails',
      'geolocalizations',
      'mineSiteLocations',
      'businessEntities',
      'mineSites',
      'exportCertificates',
      'lots',
      'licenses',
      'inspections',
      'tags',
      'taxes',
      'statusHistory'
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
    sql += `CREATE TABLE IF NOT EXISTS mineSiteMinerals (
  mineSiteId TEXT NOT NULL,
  mineralCode TEXT NOT NULL,
  PRIMARY KEY (mineSiteId, mineralCode),
  FOREIGN KEY (mineSiteId) REFERENCES mineSites(icglrId)
);

`;

    // Lot creator roles
    sql += `CREATE TABLE IF NOT EXISTS lotCreatorRoles (
  lotNumber TEXT NOT NULL,
  roleCode INTEGER NOT NULL CHECK(roleCode BETWEEN 1 AND 8),
  PRIMARY KEY (lotNumber, roleCode),
  FOREIGN KEY (lotNumber) REFERENCES lots(lotNumber)
);

`;

    // Lot originating operations
    sql += `CREATE TABLE IF NOT EXISTS lotOriginatingOperations (
  lotNumber TEXT NOT NULL,
  operationCode INTEGER NOT NULL CHECK(operationCode BETWEEN 1 AND 8),
  PRIMARY KEY (lotNumber, operationCode),
  FOREIGN KEY (lotNumber) REFERENCES lots(lotNumber)
);

`;

    // Lot input lots (recursive)
    sql += `CREATE TABLE IF NOT EXISTS lotInputLots (
  lotNumber TEXT NOT NULL,
  inputLotNumber TEXT NOT NULL,
  PRIMARY KEY (lotNumber, inputLotNumber),
  FOREIGN KEY (lotNumber) REFERENCES lots(lotNumber),
  FOREIGN KEY (inputLotNumber) REFERENCES lots(lotNumber)
);

`;

    // Status history table (if not already generated)
    if (!tablesByName['statusHistory']) {
      sql += `CREATE TABLE IF NOT EXISTS statusHistory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mineSiteId TEXT NOT NULL,
  dateOfChange DATE NOT NULL,
  newStatus INTEGER NOT NULL CHECK(newStatus IN (0, 1, 2, 3)),
  FOREIGN KEY (mineSiteId) REFERENCES mineSites(icglrId)
);

CREATE INDEX IF NOT EXISTS idx_statusHistory_mineSiteId ON statusHistory(mineSiteId);
CREATE INDEX IF NOT EXISTS idx_statusHistory_dateOfChange ON statusHistory(dateOfChange);

`;
    }

    // License commodities junction table
    sql += `CREATE TABLE IF NOT EXISTS licenseCommodities (
  licenseId INTEGER NOT NULL,
  mineralCode TEXT NOT NULL,
  PRIMARY KEY (licenseId, mineralCode),
  FOREIGN KEY (licenseId) REFERENCES licenses(id)
);

`;

    // Lot tags junction table
    sql += `CREATE TABLE IF NOT EXISTS lotTags (
  lotNumber TEXT NOT NULL,
  tagIdentifier TEXT NOT NULL,
  PRIMARY KEY (lotNumber, tagIdentifier),
  FOREIGN KEY (lotNumber) REFERENCES lots(lotNumber),
  FOREIGN KEY (tagIdentifier) REFERENCES tags(identifier)
);

`;

    // Lot taxes junction table
    sql += `CREATE TABLE IF NOT EXISTS lotTaxes (
  lotNumber TEXT NOT NULL,
  taxId INTEGER NOT NULL,
  PRIMARY KEY (lotNumber, taxId),
  FOREIGN KEY (lotNumber) REFERENCES lots(lotNumber),
  FOREIGN KEY (taxId) REFERENCES taxes(id)
);

`;

    return sql;
  }
}

module.exports = JsonSchemaToSql;

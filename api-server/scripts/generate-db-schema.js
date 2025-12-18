/**
 * Generate SQLite database schema from JSON schemas
 * Automatically generates DDL from JSON schemas using json-schema-to-sql
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const JsonSchemaToSql = require('./json-schema-to-sql');

const schemasDir = path.join(__dirname, '../../schemas');
const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'icglr.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize generator
const generator = new JsonSchemaToSql(schemasDir);

// Load all schemas
console.log('Loading JSON schemas...');
generator.loadSchemas();
console.log(`  Loaded ${Object.keys(generator.schemas).length} schemas`);

// Generate tables
console.log('Generating database tables...');
generator.generateAllTables();
console.log(`  Generated ${generator.tables.length} tables`);

// Generate SQL
const sql = generator.generateSQL();

// Optionally save SQL to file
const sqlPath = path.join(dataDir, 'schema.sql');
fs.writeFileSync(sqlPath, sql);
console.log(`  SQL saved to: ${sqlPath}`);

// Create/connect to database
const db = new Database(dbPath);

// Execute schema
db.exec(sql);

console.log('✓ Database schema generated successfully');
console.log(`  Database: ${dbPath}`);

db.close();


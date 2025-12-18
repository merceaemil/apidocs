/**
 * Database connection and utilities
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/icglr.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper functions
const dbHelpers = {
  // Generic insert
  insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const stmt = db.prepare(sql);
    return stmt.run(...values);
  },

  // Generic update
  update(table, idField, idValue, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = ?`;
    const stmt = db.prepare(sql);
    return stmt.run(...values, idValue);
  },

  // Generic find by ID
  findById(table, idField, idValue) {
    const sql = `SELECT * FROM ${table} WHERE ${idField} = ?`;
    const stmt = db.prepare(sql);
    return stmt.get(idValue);
  },

  // Generic find all with pagination
  findAll(table, filters = {}, page = 1, limit = 20) {
    let sql = `SELECT * FROM ${table}`;
    const conditions = [];
    const values = [];

    // Build WHERE clause
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Get total count
    const countSql = sql.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
    const countStmt = db.prepare(countSql);
    const { total } = countStmt.get(...values);

    // Add pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT ? OFFSET ?`;
    const stmt = db.prepare(sql);
    const data = stmt.all(...values, limit, offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    };
  },

  // Generic delete
  delete(table, idField, idValue) {
    const sql = `DELETE FROM ${table} WHERE ${idField} = ?`;
    const stmt = db.prepare(sql);
    return stmt.run(idValue);
  }
};

module.exports = {
  db,
  ...dbHelpers
};


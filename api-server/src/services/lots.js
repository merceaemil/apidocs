/**
 * Lots Service
 */

const { db } = require('../database');
const validator = require('../../../conformance/validators/schema-validator');

// Import helper functions from mine-sites service
const mineSitesService = require('./mine-sites');
const insertOrGetBusinessEntity = mineSitesService.insertOrGetBusinessEntity;
const getBusinessEntity = mineSitesService.getBusinessEntity;

function reconstructLot(row) {
  const creator = getBusinessEntity(row.creator_id);
  const recipient = row.recipient_id ? getBusinessEntity(row.recipient_id) : null;
  const tagIssuer = getBusinessEntity(row.tag_issuer_id);

  // Get creator roles
  const creatorRoles = db.prepare(`
    SELECT role_code FROM lot_creator_roles WHERE lot_number = ?
  `).all(row.lot_number).map(r => r.role_code);

  // Get originating operations
  const originatingOperations = db.prepare(`
    SELECT operation_code FROM lot_originating_operations WHERE lot_number = ?
  `).all(row.lot_number).map(r => r.operation_code);

  // Get input lots
  const inputLots = db.prepare(`
    SELECT input_lot_number FROM lot_input_lots WHERE lot_number = ?
  `).all(row.lot_number).map(r => ({ lot_number: r.input_lot_number }));

  // Get tag
  const tagRow = db.prepare(`
    SELECT t.*, be.identifier as issuer_identifier
    FROM tags t
    JOIN business_entities be ON t.issuer_id = be.identifier
    WHERE t.identifier = ?
  `).get(row.tag_identifier);

  const tag = tagRow ? {
    identifier: tagRow.identifier,
    issuer: getBusinessEntity(tagRow.issuer_identifier),
    issue_date: tagRow.issue_date,
    issue_time: tagRow.issue_time
  } : null;

  // Get taxes
  const taxes = db.prepare(`
    SELECT t.* FROM taxes t
    JOIN lot_taxes lt ON t.id = lt.tax_id
    WHERE lt.lot_number = ?
  `).all(row.lot_number).map(taxRow => ({
    tax_type: taxRow.tax_type,
    tax_amount: taxRow.tax_amount,
    currency: taxRow.currency
  }));

  return {
    lot_number: row.lot_number,
    timestamp: row.timestamp,
    creator: creator,
    mineral: row.mineral,
    concentration: row.concentration,
    mass: row.mass,
    package_type: row.package_type,
    unit_of_measurement: row.unit_of_measurement,
    mine_site_id: row.mine_site_id,
    creator_role: creatorRoles,
    recipient: recipient,
    originating_operation: originatingOperations,
    input_lot: inputLots,
    tag: tag,
    tax_paid: taxes,
    date_sealed: row.date_sealed,
    date_shipped: row.date_shipped,
    purchase_number: null, // TODO: Store purchase_number
    purchase_date: row.purchase_date,
    responsible_staff: row.responsible_staff,
    date_in: row.date_in,
    transportation_method: row.transportation_method,
    transportation_route: row.transportation_route,
    transport_company: row.transport_company,
    export_certificate_id: row.export_certificate_id
  };
}

class LotsService {
  list(filters = {}, page = 1, limit = 20) {
    let sql = 'SELECT * FROM lots WHERE 1=1';
    const conditions = [];
    const values = [];

    if (filters.mine_site_id) {
      conditions.push('mine_site_id = ?');
      values.push(filters.mine_site_id);
    }
    if (filters.mineral) {
      conditions.push('mineral = ?');
      values.push(filters.mineral);
    }
    if (filters.lot_number) {
      conditions.push('lot_number = ?');
      values.push(filters.lot_number);
    }
    if (filters.timestamp_from) {
      conditions.push('timestamp >= ?');
      values.push(filters.timestamp_from);
    }
    if (filters.timestamp_to) {
      conditions.push('timestamp <= ?');
      values.push(filters.timestamp_to);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    // Filter by creator_role if specified
    if (filters.creator_role) {
      const lotsWithRole = db.prepare(`
        SELECT DISTINCT lot_number FROM lot_creator_roles WHERE role_code = ?
      `).all(filters.creator_role).map(r => r.lot_number);
      
      if (lotsWithRole.length > 0) {
        conditions.push('lot_number IN (' + lotsWithRole.map(() => '?').join(',') + ')');
        values.push(...lotsWithRole);
      } else {
        // No lots match, return empty
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        };
      }
    }

    // Filter by originating_operation if specified
    if (filters.originating_operation) {
      const lotsWithOp = db.prepare(`
        SELECT DISTINCT lot_number FROM lot_originating_operations WHERE operation_code = ?
      `).all(filters.originating_operation).map(r => r.lot_number);
      
      if (lotsWithOp.length > 0) {
        if (!conditions.includes('lot_number IN')) {
          conditions.push('lot_number IN (' + lotsWithOp.map(() => '?').join(',') + ')');
          values.push(...lotsWithOp);
        } else {
          // Intersect with existing filter
          const existing = values.filter((v, i) => conditions[i]?.includes('lot_number IN'));
          // Simplified: just use the more restrictive filter
        }
      } else {
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        };
      }
    }

    const countSql = sql.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
    const countStmt = db.prepare(countSql);
    const { total } = countStmt.get(...values);

    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    const stmt = db.prepare(sql);
    const rows = stmt.all(...values, limit, offset);

    return {
      data: rows.map(row => reconstructLot(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      }
    };
  }

  getById(lotNumber) {
    const row = db.prepare('SELECT * FROM lots WHERE lot_number = ?').get(lotNumber);
    if (!row) {
      const error = new Error('Lot not found');
      error.code = 'NOT_FOUND';
      error.status = 404;
      throw error;
    }
    return reconstructLot(row);
  }

  create(data) {
    const validation = validator.validate(data, 'lot');
    if (!validation.valid) {
      const error = new Error('Validation failed');
      error.validation = true;
      error.errors = validation.errors;
      throw error;
    }

    const transaction = db.transaction(() => {
      insertOrGetBusinessEntity(data.creator);
      if (data.recipient) {
        insertOrGetBusinessEntity(data.recipient);
      }
      if (data.tag && data.tag.issuer) {
        insertOrGetBusinessEntity(data.tag.issuer);
      }

      // Insert tag if present
      if (data.tag) {
        db.prepare(`
          INSERT OR IGNORE INTO tags (identifier, issuer_id, issue_date, issue_time)
          VALUES (?, ?, ?, ?)
        `).run(
          data.tag.identifier,
          data.tag.issuer.identifier,
          data.tag.issue_date,
          data.tag.issue_time || null
        );
      }

      // Insert taxes if present
      const taxIds = [];
      if (data.tax_paid && data.tax_paid.length > 0) {
        const insertTax = db.prepare(`
          INSERT INTO taxes (tax_type, tax_amount, currency) VALUES (?, ?, ?)
        `);
        data.tax_paid.forEach(tax => {
          const result = insertTax.run(tax.tax_type, tax.tax_amount, tax.currency);
          taxIds.push(result.lastInsertRowid);
        });
      }

      // Insert lot
      db.prepare(`
        INSERT INTO lots 
        (lot_number, timestamp, creator_id, mineral, concentration, mass, package_type,
         unit_of_measurement, mine_site_id, recipient_id, tag_identifier, tag_issuer_id,
         tag_issue_date, tag_issue_time, date_sealed, date_shipped, purchase_date,
         responsible_staff, date_in, transportation_method, transportation_route,
         transport_company, export_certificate_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.lot_number,
        data.timestamp,
        data.creator.identifier,
        data.mineral,
        data.concentration,
        data.mass,
        data.package_type || null,
        data.unit_of_measurement,
        data.mine_site_id || null,
        data.recipient?.identifier || null,
        data.tag?.identifier || null,
        data.tag?.issuer?.identifier || null,
        data.tag?.issue_date || null,
        data.tag?.issue_time || null,
        data.date_sealed,
        data.date_shipped,
        data.purchase_date || null,
        data.responsible_staff || null,
        data.date_in || null,
        data.transportation_method || null,
        data.transportation_route || null,
        data.transport_company || null,
        data.export_certificate_id || null
      );

      // Insert creator roles
      if (data.creator_role && data.creator_role.length > 0) {
        const insertRole = db.prepare(`
          INSERT INTO lot_creator_roles (lot_number, role_code) VALUES (?, ?)
        `);
        data.creator_role.forEach(role => {
          insertRole.run(data.lot_number, role);
        });
      }

      // Insert originating operations
      if (data.originating_operation && data.originating_operation.length > 0) {
        const insertOp = db.prepare(`
          INSERT INTO lot_originating_operations (lot_number, operation_code) VALUES (?, ?)
        `);
        data.originating_operation.forEach(op => {
          insertOp.run(data.lot_number, op);
        });
      }

      // Insert input lots
      if (data.input_lot && data.input_lot.length > 0) {
        const insertInput = db.prepare(`
          INSERT INTO lot_input_lots (lot_number, input_lot_number) VALUES (?, ?)
        `);
        data.input_lot.forEach(input => {
          insertInput.run(data.lot_number, input.lot_number);
        });
      }

      // Link taxes
      if (taxIds.length > 0) {
        const linkTax = db.prepare(`
          INSERT INTO lot_taxes (lot_number, tax_id) VALUES (?, ?)
        `);
        taxIds.forEach(taxId => {
          linkTax.run(data.lot_number, taxId);
        });
      }
    });

    transaction();

    return this.getById(data.lot_number);
  }
}

module.exports = new LotsService();

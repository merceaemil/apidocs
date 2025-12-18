/**
 * Export Certificates Service
 */

const { db } = require('../database');
const validator = require('../../../conformance/validators/schema-validator');

// Import helper functions from mine-sites service
const mineSitesService = require('./mine-sites');
const insertOrGetBusinessEntity = mineSitesService.insertOrGetBusinessEntity;
const getBusinessEntity = mineSitesService.getBusinessEntity;

function reconstructExportCertificate(row) {
  const exporter = getBusinessEntity(row.exporter_id);
  const importer = getBusinessEntity(row.importer_id);

  return {
    issuing_country: row.issuing_country,
    identifier: row.identifier,
    exporter: exporter,
    importer: importer,
    lot_number: row.lot_number,
    designated_mineral_description: row.designated_mineral_description,
    type_of_ore: row.type_of_ore,
    lot_weight: row.lot_weight,
    lot_weight_uom: row.lot_weight_uom,
    lot_grade: row.lot_grade,
    mineral_origin: row.mineral_origin,
    customs_value: row.customs_value,
    date_of_shipment: row.date_of_shipment,
    shipment_route: row.shipment_route,
    transport_company: row.transport_company,
    member_state_issuing_authority: row.member_state_issuing_authority,
    name_of_verifier: row.name_of_verifier,
    position_of_verifier: row.position_of_verifier,
    id_of_verifier: row.id_of_verifier,
    date_of_verification: row.date_of_verification,
    name_of_validator: row.name_of_validator,
    date_of_issuance: row.date_of_issuance,
    date_of_expiration: row.date_of_expiration,
    certificate_file: row.certificate_file
  };
}

class ExportCertificatesService {
  list(filters = {}, page = 1, limit = 20) {
    let sql = 'SELECT * FROM export_certificates WHERE 1=1';
    const conditions = [];
    const values = [];

    if (filters.issuing_country) {
      conditions.push('issuing_country = ?');
      values.push(filters.issuing_country);
    }
    if (filters.identifier) {
      conditions.push('identifier = ?');
      values.push(filters.identifier);
    }
    if (filters.lot_number) {
      conditions.push('lot_number = ?');
      values.push(filters.lot_number);
    }
    if (filters.type_of_ore) {
      conditions.push('type_of_ore = ?');
      values.push(filters.type_of_ore);
    }
    if (filters.date_of_issuance_from) {
      conditions.push('date_of_issuance >= ?');
      values.push(filters.date_of_issuance_from);
    }
    if (filters.date_of_issuance_to) {
      conditions.push('date_of_issuance <= ?');
      values.push(filters.date_of_issuance_to);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    const countSql = sql.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
    const countStmt = db.prepare(countSql);
    const { total } = countStmt.get(...values);

    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    const stmt = db.prepare(sql);
    const rows = stmt.all(...values, limit, offset);

    return {
      data: rows.map(row => reconstructExportCertificate(row)),
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

  getById(identifier, issuingCountry) {
    const row = db.prepare(`
      SELECT * FROM export_certificates 
      WHERE identifier = ? AND issuing_country = ?
    `).get(identifier, issuingCountry);

    if (!row) {
      const error = new Error('Export certificate not found');
      error.code = 'NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return reconstructExportCertificate(row);
  }

  create(data) {
    const validation = validator.validate(data, 'export-certificate');
    if (!validation.valid) {
      const error = new Error('Validation failed');
      error.validation = true;
      error.errors = validation.errors;
      throw error;
    }

    const transaction = db.transaction(() => {
      insertOrGetBusinessEntity(data.exporter);
      insertOrGetBusinessEntity(data.importer);

      db.prepare(`
        INSERT INTO export_certificates 
        (issuing_country, identifier, exporter_id, importer_id, lot_number,
         designated_mineral_description, type_of_ore, lot_weight, lot_weight_uom,
         lot_grade, mineral_origin, customs_value, date_of_shipment, shipment_route,
         transport_company, member_state_issuing_authority, name_of_verifier,
         position_of_verifier, id_of_verifier, date_of_verification, name_of_validator,
         date_of_issuance, date_of_expiration, certificate_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.issuing_country,
        data.identifier,
        data.exporter.identifier,
        data.importer.identifier,
        data.lot_number,
        data.designated_mineral_description,
        data.type_of_ore,
        data.lot_weight,
        data.lot_weight_uom,
        data.lot_grade,
        data.mineral_origin,
        data.customs_value,
        data.date_of_shipment,
        data.shipment_route || null,
        data.transport_company || null,
        data.member_state_issuing_authority,
        data.name_of_verifier,
        data.position_of_verifier,
        data.id_of_verifier || null,
        data.date_of_verification,
        data.name_of_validator,
        data.date_of_issuance,
        data.date_of_expiration,
        data.certificate_file
      );
    });

    transaction();

    return this.getById(data.identifier, data.issuing_country);
  }
}

module.exports = new ExportCertificatesService();

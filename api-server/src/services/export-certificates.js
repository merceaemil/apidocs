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
  const exporter = getBusinessEntity(row.exporterId);
  const importer = getBusinessEntity(row.importerId);

  return {
    issuingCountry: row.issuingCountry,
    identifier: row.identifier,
    exporter: exporter,
    importer: importer,
    lotNumber: row.lotNumber,
    designatedMineralDescription: row.designatedMineralDescription,
    typeOfOre: row.typeOfOre,
    lotWeight: row.lotWeight,
    lotWeightUOM: row.lotWeightUOM,
    lotGrade: row.lotGrade,
    mineralOrigin: row.mineralOrigin,
    customsValue: row.customsValue,
    dateOfShipment: row.dateOfShipment,
    shipmentRoute: row.shipmentRoute,
    transportCompany: row.transportCompany,
    memberStateIssuingAuthority: row.memberStateIssuingAuthority,
    nameOfVerifier: row.nameOfVerifier,
    positionOfVerifier: row.positionOfVerifier,
    idOfVerifier: row.idOfVerifier,
    dateOfVerification: row.dateOfVerification,
    nameOfValidator: row.nameOfValidator,
    dateOfIssuance: row.dateOfIssuance,
    dateOfExpiration: row.dateOfExpiration,
    certificateFile: row.certificateFile
  };
}

class ExportCertificatesService {
  list(filters = {}, page = 1, limit = 20) {
    let sql = 'SELECT * FROM exportCertificates WHERE 1=1';
    const conditions = [];
    const values = [];

    if (filters.issuingCountry) {
      conditions.push('issuingCountry = ?');
      values.push(filters.issuingCountry);
    }
    if (filters.identifier) {
      conditions.push('identifier = ?');
      values.push(filters.identifier);
    }
    if (filters.lotNumber) {
      conditions.push('lotNumber = ?');
      values.push(filters.lotNumber);
    }
    if (filters.typeOfOre) {
      conditions.push('typeOfOre = ?');
      values.push(filters.typeOfOre);
    }
    if (filters.dateOfIssuanceFrom) {
      conditions.push('dateOfIssuance >= ?');
      values.push(filters.dateOfIssuanceFrom);
    }
    if (filters.dateOfIssuanceTo) {
      conditions.push('dateOfIssuance <= ?');
      values.push(filters.dateOfIssuanceTo);
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
      SELECT * FROM exportCertificates 
      WHERE identifier = ? AND issuingCountry = ?
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

      const exportCertificateId = `${data.issuingCountry}:${data.identifier}`;

      db.prepare(`
        INSERT INTO exportCertificates 
        (exportCertificateId, issuingCountry, identifier, exporterId, importerId, lotNumber,
         designatedMineralDescription, typeOfOre, lotWeight, lotWeightUOM,
         lotGrade, mineralOrigin, customsValue, dateOfShipment, shipmentRoute,
         transportCompany, memberStateIssuingAuthority, nameOfVerifier,
         positionOfVerifier, idOfVerifier, dateOfVerification, nameOfValidator,
         dateOfIssuance, dateOfExpiration, certificateFile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        exportCertificateId,
        data.issuingCountry,
        data.identifier,
        data.exporter.identifier,
        data.importer.identifier,
        data.lotNumber,
        data.designatedMineralDescription || null,
        data.typeOfOre,
        data.lotWeight,
        data.lotWeightUOM,
        data.lotGrade,
        data.mineralOrigin,
        data.customsValue,
        data.dateOfShipment,
        data.shipmentRoute || null,
        data.transportCompany || null,
        data.memberStateIssuingAuthority,
        data.nameOfVerifier,
        data.positionOfVerifier,
        data.idOfVerifier || null,
        data.dateOfVerification,
        data.nameOfValidator,
        data.dateOfIssuance,
        data.dateOfExpiration,
        data.certificateFile
      );
    });

    transaction();

    return this.getById(data.identifier, data.issuingCountry);
  }
}

module.exports = new ExportCertificatesService();

/**
 * Generate REST API server from OpenAPI specification
 * Creates Express.js routes, handlers, and services with database integration
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const openApiPath = path.join(__dirname, '../../api/openapi.yaml');
const outputDir = path.join(__dirname, '../src');
const routesDir = path.join(outputDir, 'routes');
const servicesDir = path.join(outputDir, 'services');
const middlewareDir = path.join(outputDir, 'middleware');

// Ensure directories exist
[outputDir, routesDir, servicesDir, middlewareDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load OpenAPI spec
console.log('Loading OpenAPI specification...');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

// Generate middleware
console.log('Generating middleware...');
generateMiddleware();

// Generate services
console.log('Generating services...');
generateServices();

// Generate routes
console.log('Generating routes...');
generateRoutes();

// Generate main server file
console.log('Generating server file...');
generateServer();

console.log('✓ API generation complete!');

/**
 * Generate middleware files
 */
function generateMiddleware() {
  // Error handler middleware
  const errorHandler = `/**
 * Error handling middleware
 */

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError' || err.validation) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.message || 'Request validation failed',
      details: err.details || err.errors || {},
      timestamp: new Date().toISOString()
    });
  }

  // Not found errors
  if (err.status === 404 || err.code === 'NOT_FOUND') {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: err.message || 'Resource not found',
      timestamp: new Date().toISOString()
    });
  }

  // Conflict errors
  if (err.status === 409 || err.code === 'CONFLICT') {
    return res.status(409).json({
      code: 'CONFLICT',
      message: err.message || 'Resource already exists',
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An internal error occurred',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
`;

  fs.writeFileSync(path.join(middlewareDir, 'error-handler.js'), errorHandler);

  // Validation middleware
  const validationMiddleware = `/**
 * Request validation middleware
 */

const validator = require('../../../conformance/validators/schema-validator');

function validateRequest(schemaName) {
  return (req, res, next) => {
    // Validate request body if present
    if (req.body && Object.keys(req.body).length > 0) {
      const result = validator.validate(req.body, schemaName);
      if (!result.valid) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: {
            errors: result.errors
          },
          timestamp: new Date().toISOString()
        });
      }
    }
    next();
  };
}

module.exports = { validateRequest };
`;

  fs.writeFileSync(path.join(middlewareDir, 'validation.js'), validationMiddleware);
}

/**
 * Generate service files for database operations
 */
function generateServices() {

  // Mine Sites Service
  const mineSitesService = `/**
 * Mine Sites Service
 * Handles database operations for mine sites
 */

const { db } = require('../database');
const validator = require('../../../conformance/validators/schema-validator');

// Helper: Insert or get address ID
function insertOrGetAddress(address) {
  const existing = db.prepare(\`
    SELECT id FROM addresses 
    WHERE country = ? AND subnational_division_l1 = ? AND address_locality = ?
  \`).get(address.country, address.subnational_division_l1, address.address_locality);

  if (existing) return existing.id;

  const result = db.prepare(\`
    INSERT INTO addresses 
    (country, subnational_division_l1, subnational_division_l1_text, 
     subnational_division_l2, subnational_division_l3, subnational_division_l4, address_locality)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  \`).run(
    address.country,
    address.subnational_division_l1,
    address.subnational_division_l1_text || null,
    address.subnational_division_l2 || null,
    address.subnational_division_l3 || null,
    address.subnational_division_l4 || null,
    address.address_locality
  );

  return result.lastInsertRowid;
}

// Helper: Insert or get contact details ID
function insertOrGetContactDetails(contactDetails) {
  const existing = db.prepare(\`
    SELECT id FROM contact_details WHERE contact_email = ?
  \`).get(contactDetails.contact_email);

  if (existing) return existing.id;

  const result = db.prepare(\`
    INSERT INTO contact_details 
    (legal_representative, contact_phone_number, contact_email)
    VALUES (?, ?, ?)
  \`).run(
    contactDetails.legal_representative,
    contactDetails.contact_phone_number,
    contactDetails.contact_email
  );

  return result.lastInsertRowid;
}

// Helper: Insert or get geolocalization ID
function insertOrGetGeolocalization(geolocalization) {
  const existing = db.prepare(\`
    SELECT id FROM geolocalizations WHERE latitude = ? AND longitude = ?
  \`).get(geolocalization.latitude, geolocalization.longitude);

  if (existing) return existing.id;

  const result = db.prepare(\`
    INSERT INTO geolocalizations (latitude, longitude) VALUES (?, ?)
  \`).run(geolocalization.latitude, geolocalization.longitude);

  return result.lastInsertRowid;
}

// Helper: Insert or get business entity
function insertOrGetBusinessEntity(entity) {
  const existing = db.prepare(\`
    SELECT identifier FROM business_entities WHERE identifier = ?
  \`).get(entity.identifier);

  if (existing) return entity.identifier;

  const legalAddressId = insertOrGetAddress(entity.legal_address);
  const physicalAddressId = insertOrGetAddress(entity.physical_address);
  const contactDetailsId = insertOrGetContactDetails(entity.contact_details);

  db.prepare(\`
    INSERT INTO business_entities 
    (identifier, name, legal_address_id, physical_address_id, tin, rdb_number, rca_number, contact_details_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  \`).run(
    entity.identifier,
    entity.name,
    legalAddressId,
    physicalAddressId,
    entity.tin,
    entity.rdb_number,
    entity.rca_number,
    contactDetailsId
  );

  return entity.identifier;
}

// Helper: Reconstruct business entity from database
function getBusinessEntity(identifier) {
  const entity = db.prepare(\`
    SELECT be.*, 
           la.country as legal_country, la.subnational_division_l1 as legal_l1, 
           la.subnational_division_l1_text as legal_l1_text,
           la.subnational_division_l2 as legal_l2, la.subnational_division_l3 as legal_l3,
           la.subnational_division_l4 as legal_l4, la.address_locality as legal_locality,
           pa.country as physical_country, pa.subnational_division_l1 as physical_l1,
           pa.subnational_division_l1_text as physical_l1_text,
           pa.subnational_division_l2 as physical_l2, pa.subnational_division_l3 as physical_l3,
           pa.subnational_division_l4 as physical_l4, pa.address_locality as physical_locality,
           cd.legal_representative, cd.contact_phone_number, cd.contact_email
    FROM business_entities be
    JOIN addresses la ON be.legal_address_id = la.id
    JOIN addresses pa ON be.physical_address_id = pa.id
    JOIN contact_details cd ON be.contact_details_id = cd.id
    WHERE be.identifier = ?
  \`).get(identifier);

  if (!entity) return null;

  return {
    identifier: entity.identifier,
    name: entity.name,
    legal_address: {
      country: entity.legal_country,
      subnational_division_l1: entity.legal_l1,
      subnational_division_l1_text: entity.legal_l1_text,
      subnational_division_l2: entity.legal_l2,
      subnational_division_l3: entity.legal_l3,
      subnational_division_l4: entity.legal_l4,
      address_locality: entity.legal_locality
    },
    physical_address: {
      country: entity.physical_country,
      subnational_division_l1: entity.physical_l1,
      subnational_division_l1_text: entity.physical_l1_text,
      subnational_division_l2: entity.physical_l2,
      subnational_division_l3: entity.physical_l3,
      subnational_division_l4: entity.physical_l4,
      address_locality: entity.physical_locality
    },
    tin: entity.tin,
    rdb_number: entity.rdb_number,
    rca_number: entity.rca_number,
    contact_details: {
      legal_representative: entity.legal_representative,
      contact_phone_number: entity.contact_phone_number,
      contact_email: entity.contact_email
    }
  };
}

// Helper: Reconstruct mine site from database
function reconstructMineSite(row) {
  const owner = getBusinessEntity(row.owner_id);
  
  // Get minerals
  const minerals = db.prepare(\`
    SELECT mineral_code FROM mine_site_minerals WHERE mine_site_id = ?
  \`).all(row.icglr_id).map(r => r.mineral_code);

  // Get mine site location (simplified - assumes one location per mine site)
  // Note: The schema doesn't have a direct link from mine_sites to mine_site_locations
  // This is a limitation - you may need to add a location_id column to mine_sites
  // For now, we'll try to find a location that might be associated
  const locationRow = db.prepare(\`
    SELECT msl.*, g.latitude, g.longitude,
           a.country, a.subnational_division_l1, a.subnational_division_l1_text,
           a.subnational_division_l2, a.subnational_division_l3, a.subnational_division_l4,
           a.address_locality
    FROM mine_site_locations msl
    JOIN geolocalizations g ON msl.geolocalization_id = g.id
    JOIN addresses a ON msl.local_geographic_designation_id = a.id
    LIMIT 1
  \`).get();

  // For now, we'll need to store location_id in mine_sites table or query differently
  // This is a simplified version - you may need to adjust based on your schema
  const location = locationRow ? {
    geolocalization: {
      latitude: locationRow.latitude,
      longitude: locationRow.longitude
    },
    national_cadaster_localization: locationRow.national_cadaster_localization,
    local_geographic_designation: {
      country: locationRow.country,
      subnational_division_l1: locationRow.subnational_division_l1,
      subnational_division_l1_text: locationRow.subnational_division_l1_text,
      subnational_division_l2: locationRow.subnational_division_l2,
      subnational_division_l3: locationRow.subnational_division_l3,
      subnational_division_l4: locationRow.subnational_division_l4,
      address_locality: locationRow.address_locality
    },
    polygon: locationRow.polygon,
    altitude: locationRow.altitude
  } : null;

  // Get licenses
  const licenses = db.prepare(\`
    SELECT l.* FROM licenses l WHERE l.owner_id = ?
  \`).all(row.owner_id).map(licenseRow => {
    const licenseOwner = getBusinessEntity(licenseRow.owner_id);
    return {
      license_type: licenseRow.license_type,
      license_id: licenseRow.license_id,
      owner: licenseOwner,
      date_applied: licenseRow.date_applied,
      date_granted: licenseRow.date_granted,
      date_expiring: licenseRow.date_expiring,
      license_status: licenseRow.license_status,
      covered_commodities: [] // TODO: Get from license_commodities junction table
    };
  });

  // Get inspections
  const inspections = db.prepare(\`
    SELECT * FROM inspections WHERE inspection_id IN (
      SELECT inspection_id FROM inspections LIMIT 10
    )
  \`).all().map(inspectionRow => ({
    inspection_id: inspectionRow.inspection_id,
    inspection_date: inspectionRow.inspection_date,
    inspection_responsible: inspectionRow.inspection_responsible,
    inspection_findings: inspectionRow.inspection_findings,
    inspection_report: inspectionRow.inspection_report,
    inspection_purpose: inspectionRow.inspection_purpose,
    inspection_results: inspectionRow.inspection_results,
    inspector_name: inspectionRow.inspector_name,
    inspector_position: inspectionRow.inspector_position,
    government_agency: inspectionRow.government_agency,
    government_id: inspectionRow.government_id
  }));

  // Get status history
  const statusHistory = db.prepare(\`
    SELECT date_of_change, new_status 
    FROM status_history WHERE mine_site_id = ?
    ORDER BY date_of_change DESC
  \`).all(row.icglr_id).map(sh => ({
    date_of_change: sh.date_of_change,
    new_status: sh.new_status
  }));

  return {
    icglr_id: row.icglr_id,
    address_country: row.address_country,
    national_id: row.national_id,
    certification_status: row.certification_status,
    activity_status: row.activity_status,
    mine_site_location: location,
    mineral: minerals,
    license: licenses,
    owner: owner,
    operator: [], // TODO: Implement operator relationship
    inspection: inspections,
    status_history: statusHistory
  };
}

class MineSitesService {
  // List mine sites with filtering and pagination
  list(filters = {}, page = 1, limit = 20) {
    let sql = 'SELECT * FROM mine_sites WHERE 1=1';
    const conditions = [];
    const values = [];

    if (filters.address_country) {
      conditions.push('address_country = ?');
      values.push(filters.address_country);
    }
    if (filters.certification_status !== undefined) {
      conditions.push('certification_status = ?');
      values.push(filters.certification_status);
    }
    if (filters.activity_status !== undefined) {
      conditions.push('activity_status = ?');
      values.push(filters.activity_status);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    // Get total count
    const countSql = sql.replace(/SELECT \\*/, 'SELECT COUNT(*) as total');
    const countStmt = db.prepare(countSql);
    const { total } = countStmt.get(...values);

    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    const stmt = db.prepare(sql);
    const rows = stmt.all(...values, limit, offset);

    // Filter by mineral if specified
    let data = rows.map(row => reconstructMineSite(row));
    if (filters.mineral) {
      data = data.filter(site => site.mineral.includes(filters.mineral));
    }

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
  }

  // Get mine site by ICGLR ID
  getById(icglrId) {
    const row = db.prepare('SELECT * FROM mine_sites WHERE icglr_id = ?').get(icglrId);
    if (!row) {
      const error = new Error('Mine site not found');
      error.code = 'NOT_FOUND';
      error.status = 404;
      throw error;
    }
    return reconstructMineSite(row);
  }

  // Create mine site
  create(data) {
    // Validate
    const validation = validator.validate(data, 'mine-site');
    if (!validation.valid) {
      const error = new Error('Validation failed');
      error.validation = true;
      error.errors = validation.errors;
      throw error;
    }

    // Check if exists
    const existing = db.prepare('SELECT icglr_id FROM mine_sites WHERE icglr_id = ?').get(data.icglr_id);
    if (existing) {
      const error = new Error('Mine site already exists');
      error.code = 'CONFLICT';
      error.status = 409;
      throw error;
    }

    const transaction = db.transaction(() => {
      // Insert business entities
      insertOrGetBusinessEntity(data.owner);
      if (data.operator) {
        data.operator.forEach(op => insertOrGetBusinessEntity(op));
      }

      // Insert mine site location
      let locationId = null;
      if (data.mine_site_location) {
        const geoId = insertOrGetGeolocalization(data.mine_site_location.geolocalization);
        const addressId = insertOrGetAddress(data.mine_site_location.local_geographic_designation);
        
        const locationResult = db.prepare(\`
          INSERT INTO mine_site_locations 
          (geolocalization_id, national_cadaster_localization, local_geographic_designation_id, polygon, altitude)
          VALUES (?, ?, ?, ?, ?)
        \`).run(
          geoId,
          data.mine_site_location.national_cadaster_localization,
          addressId,
          data.mine_site_location.polygon || null,
          data.mine_site_location.altitude || null
        );
        locationId = locationResult.lastInsertRowid;
      }

      // Insert mine site
      db.prepare(\`
        INSERT INTO mine_sites 
        (icglr_id, address_country, national_id, certification_status, activity_status, owner_id)
        VALUES (?, ?, ?, ?, ?, ?)
      \`).run(
        data.icglr_id,
        data.address_country,
        data.national_id,
        data.certification_status,
        data.activity_status,
        data.owner.identifier
      );

      // Insert minerals
      if (data.mineral && data.mineral.length > 0) {
        const insertMineral = db.prepare(\`
          INSERT INTO mine_site_minerals (mine_site_id, mineral_code) VALUES (?, ?)
        \`);
        data.mineral.forEach(mineral => {
          insertMineral.run(data.icglr_id, mineral);
        });
      }

      // Insert licenses
      if (data.license && data.license.length > 0) {
        data.license.forEach(license => {
          insertOrGetBusinessEntity(license.owner);
          db.prepare(\`
            INSERT INTO licenses 
            (license_type, license_id, owner_id, date_applied, date_granted, date_expiring, license_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          \`).run(
            license.license_type,
            license.license_id,
            license.owner.identifier,
            license.date_applied || null,
            license.date_granted || null,
            license.date_expiring || null,
            license.license_status || null
          );
        });
      }

      // Insert inspections
      if (data.inspection && data.inspection.length > 0) {
        const insertInspection = db.prepare(\`
          INSERT INTO inspections 
          (inspection_id, inspection_date, inspection_responsible, inspection_findings,
           inspection_report, inspection_purpose, inspection_results, inspector_name, inspector_position,
           government_agency, government_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`);
        data.inspection.forEach(inspection => {
          insertInspection.run(
            inspection.inspection_id,
            inspection.inspection_date,
            inspection.inspection_responsible,
            inspection.inspection_findings,
            inspection.inspection_report,
            inspection.inspection_purpose,
            inspection.inspection_results,
            inspection.inspector_name,
            inspection.inspector_position,
            inspection.government_agency,
            inspection.government_id || null
          );
        });
      }

      // Insert status history
      if (data.status_history && data.status_history.length > 0) {
        const insertStatus = db.prepare(\`
          INSERT INTO status_history (mine_site_id, date_of_change, new_status)
          VALUES (?, ?, ?)
        \`);
        data.status_history.forEach(status => {
          insertStatus.run(data.icglr_id, status.date_of_change, status.new_status);
        });
      }
    });

    transaction();

    return this.getById(data.icglr_id);
  }

  // Update mine site
  update(icglrId, data) {
    const existing = this.getById(icglrId); // Throws if not found

    // Validate
    const validation = validator.validate(data, 'mine-site');
    if (!validation.valid) {
      const error = new Error('Validation failed');
      error.validation = true;
      error.errors = validation.errors;
      throw error;
    }

    // Update basic fields
    db.prepare(\`
      UPDATE mine_sites 
      SET address_country = ?, national_id = ?, certification_status = ?, activity_status = ?, owner_id = ?
      WHERE icglr_id = ?
    \`).run(
      data.address_country,
      data.national_id,
      data.certification_status,
      data.activity_status,
      data.owner.identifier,
      icglrId
    );

    // TODO: Update related entities (location, minerals, licenses, etc.)
    // For now, we'll just update the basic fields

    return this.getById(icglrId);
  }
}

const service = new MineSitesService();
// Export helper functions for use by other services
service.insertOrGetBusinessEntity = insertOrGetBusinessEntity;
service.getBusinessEntity = getBusinessEntity;

module.exports = service;
`;

  fs.writeFileSync(path.join(servicesDir, 'mine-sites.js'), mineSitesService);

  // Export Certificates Service
  const exportCertificatesService = `/**
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

    const countSql = sql.replace(/SELECT \\*/, 'SELECT COUNT(*) as total');
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
    const row = db.prepare(\`
      SELECT * FROM export_certificates 
      WHERE identifier = ? AND issuing_country = ?
    \`).get(identifier, issuingCountry);

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

      db.prepare(\`
        INSERT INTO export_certificates 
        (issuing_country, identifier, exporter_id, importer_id, lot_number,
         designated_mineral_description, type_of_ore, lot_weight, lot_weight_uom,
         lot_grade, mineral_origin, customs_value, date_of_shipment, shipment_route,
         transport_company, member_state_issuing_authority, name_of_verifier,
         position_of_verifier, id_of_verifier, date_of_verification, name_of_validator,
         date_of_issuance, date_of_expiration, certificate_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`).run(
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
`;

  fs.writeFileSync(path.join(servicesDir, 'export-certificates.js'), exportCertificatesService);

  // Lots Service
  const lotsService = `/**
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
  const creatorRoles = db.prepare(\`
    SELECT role_code FROM lot_creator_roles WHERE lot_number = ?
  \`).all(row.lot_number).map(r => r.role_code);

  // Get originating operations
  const originatingOperations = db.prepare(\`
    SELECT operation_code FROM lot_originating_operations WHERE lot_number = ?
  \`).all(row.lot_number).map(r => r.operation_code);

  // Get input lots
  const inputLots = db.prepare(\`
    SELECT input_lot_number FROM lot_input_lots WHERE lot_number = ?
  \`).all(row.lot_number).map(r => ({ lot_number: r.input_lot_number }));

  // Get tag
  const tagRow = db.prepare(\`
    SELECT t.*, be.identifier as issuer_identifier
    FROM tags t
    JOIN business_entities be ON t.issuer_id = be.identifier
    WHERE t.identifier = ?
  \`).get(row.tag_identifier);

  const tag = tagRow ? {
    identifier: tagRow.identifier,
    issuer: getBusinessEntity(tagRow.issuer_identifier),
    issue_date: tagRow.issue_date,
    issue_time: tagRow.issue_time
  } : null;

  // Get taxes
  const taxes = db.prepare(\`
    SELECT t.* FROM taxes t
    JOIN lot_taxes lt ON t.id = lt.tax_id
    WHERE lt.lot_number = ?
  \`).all(row.lot_number).map(taxRow => ({
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
      const lotsWithRole = db.prepare(\`
        SELECT DISTINCT lot_number FROM lot_creator_roles WHERE role_code = ?
      \`).all(filters.creator_role).map(r => r.lot_number);
      
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
      const lotsWithOp = db.prepare(\`
        SELECT DISTINCT lot_number FROM lot_originating_operations WHERE operation_code = ?
      \`).all(filters.originating_operation).map(r => r.lot_number);
      
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

    const countSql = sql.replace(/SELECT \\*/, 'SELECT COUNT(*) as total');
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
        db.prepare(\`
          INSERT OR IGNORE INTO tags (identifier, issuer_id, issue_date, issue_time)
          VALUES (?, ?, ?, ?)
        \`).run(
          data.tag.identifier,
          data.tag.issuer.identifier,
          data.tag.issue_date,
          data.tag.issue_time || null
        );
      }

      // Insert taxes if present
      const taxIds = [];
      if (data.tax_paid && data.tax_paid.length > 0) {
        const insertTax = db.prepare(\`
          INSERT INTO taxes (tax_type, tax_amount, currency) VALUES (?, ?, ?)
        \`);
        data.tax_paid.forEach(tax => {
          const result = insertTax.run(tax.tax_type, tax.tax_amount, tax.currency);
          taxIds.push(result.lastInsertRowid);
        });
      }

      // Insert lot
      db.prepare(\`
        INSERT INTO lots 
        (lot_number, timestamp, creator_id, mineral, concentration, mass, package_type,
         unit_of_measurement, mine_site_id, recipient_id, tag_identifier, tag_issuer_id,
         tag_issue_date, tag_issue_time, date_sealed, date_shipped, purchase_date,
         responsible_staff, date_in, transportation_method, transportation_route,
         transport_company, export_certificate_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`).run(
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
        const insertRole = db.prepare(\`
          INSERT INTO lot_creator_roles (lot_number, role_code) VALUES (?, ?)
        \`);
        data.creator_role.forEach(role => {
          insertRole.run(data.lot_number, role);
        });
      }

      // Insert originating operations
      if (data.originating_operation && data.originating_operation.length > 0) {
        const insertOp = db.prepare(\`
          INSERT INTO lot_originating_operations (lot_number, operation_code) VALUES (?, ?)
        \`);
        data.originating_operation.forEach(op => {
          insertOp.run(data.lot_number, op);
        });
      }

      // Insert input lots
      if (data.input_lot && data.input_lot.length > 0) {
        const insertInput = db.prepare(\`
          INSERT INTO lot_input_lots (lot_number, input_lot_number) VALUES (?, ?)
        \`);
        data.input_lot.forEach(input => {
          insertInput.run(data.lot_number, input.lot_number);
        });
      }

      // Link taxes
      if (taxIds.length > 0) {
        const linkTax = db.prepare(\`
          INSERT INTO lot_taxes (lot_number, tax_id) VALUES (?, ?)
        \`);
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
`;

  fs.writeFileSync(path.join(servicesDir, 'lots.js'), lotsService);
}

/**
 * Generate route handlers
 */
function generateRoutes() {
  // Mine Sites Routes
  const mineSitesRoutes = `/**
 * Mine Sites Routes
 */

const express = require('express');
const router = express.Router();
const mineSitesService = require('../services/mine-sites');
const { validateRequest } = require('../middleware/validation');

// List mine sites
router.get('/', (req, res, next) => {
  try {
    const filters = {
      address_country: req.query.address_country,
      certification_status: req.query.certification_status ? parseInt(req.query.certification_status) : undefined,
      activity_status: req.query.activity_status ? parseInt(req.query.activity_status) : undefined,
      mineral: req.query.mineral
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const result = mineSitesService.list(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get mine site by ID
router.get('/:icglr_id', (req, res, next) => {
  try {
    const mineSite = mineSitesService.getById(req.params.icglr_id);
    res.json(mineSite);
  } catch (error) {
    next(error);
  }
});

// Create mine site
router.post('/', validateRequest('mine-site'), (req, res, next) => {
  try {
    const mineSite = mineSitesService.create(req.body);
    res.status(201).json(mineSite);
  } catch (error) {
    next(error);
  }
});

// Update mine site
router.put('/:icglr_id', validateRequest('mine-site'), (req, res, next) => {
  try {
    const mineSite = mineSitesService.update(req.params.icglr_id, req.body);
    res.json(mineSite);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
`;

  fs.writeFileSync(path.join(routesDir, 'mine-sites.js'), mineSitesRoutes);

  // Export Certificates Routes
  const exportCertificatesRoutes = `/**
 * Export Certificates Routes
 */

const express = require('express');
const router = express.Router();
const exportCertificatesService = require('../services/export-certificates');
const { validateRequest } = require('../middleware/validation');

// List export certificates
router.get('/', (req, res, next) => {
  try {
    const filters = {
      issuing_country: req.query.issuing_country,
      identifier: req.query.identifier,
      lot_number: req.query.lot_number,
      type_of_ore: req.query.type_of_ore,
      date_of_issuance_from: req.query.date_of_issuance_from,
      date_of_issuance_to: req.query.date_of_issuance_to
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const result = exportCertificatesService.list(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get export certificate by ID
router.get('/:identifier', (req, res, next) => {
  try {
    if (!req.query.issuing_country) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'issuing_country query parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const certificate = exportCertificatesService.getById(
      req.params.identifier,
      req.query.issuing_country
    );
    res.json(certificate);
  } catch (error) {
    next(error);
  }
});

// Create export certificate
router.post('/', validateRequest('export-certificate'), (req, res, next) => {
  try {
    const certificate = exportCertificatesService.create(req.body);
    res.status(201).json(certificate);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
`;

  fs.writeFileSync(path.join(routesDir, 'export-certificates.js'), exportCertificatesRoutes);

  // Lots Routes
  const lotsRoutes = `/**
 * Lots Routes
 */

const express = require('express');
const router = express.Router();
const lotsService = require('../services/lots');
const { validateRequest } = require('../middleware/validation');

// List lots
router.get('/', (req, res, next) => {
  try {
    const filters = {
      mine_site_id: req.query.mine_site_id,
      mineral: req.query.mineral,
      creator_role: req.query.creator_role ? parseInt(req.query.creator_role) : undefined,
      originating_operation: req.query.originating_operation ? parseInt(req.query.originating_operation) : undefined,
      lot_number: req.query.lot_number,
      timestamp_from: req.query.timestamp_from,
      timestamp_to: req.query.timestamp_to
    };

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const result = lotsService.list(filters, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get lot by ID
router.get('/:lot_number', (req, res, next) => {
  try {
    const lot = lotsService.getById(req.params.lot_number);
    res.json(lot);
  } catch (error) {
    next(error);
  }
});

// Create lot
router.post('/', validateRequest('lot'), (req, res, next) => {
  try {
    const lot = lotsService.create(req.body);
    res.status(201).json(lot);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
`;

  fs.writeFileSync(path.join(routesDir, 'lots.js'), lotsRoutes);

  // Health check route
  const healthRoute = `/**
 * Health Check Route
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
`;

  fs.writeFileSync(path.join(routesDir, 'health.js'), healthRoute);

  // GraphQL route (placeholder)
  const graphqlRoute = `/**
 * GraphQL Route
 * Placeholder for GraphQL implementation
 */

const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
  // TODO: Implement GraphQL endpoint
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'GraphQL endpoint is not yet implemented',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
`;

  fs.writeFileSync(path.join(routesDir, 'graphql.js'), graphqlRoute);
}

/**
 * Generate main server file
 */
function generateServer() {
  const server = `/**
 * ICGLR API Server
 * Auto-generated from OpenAPI specification
 */

require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const errorHandler = require('./middleware/error-handler');

// Import routes
const mineSitesRoutes = require('./routes/mine-sites');
const exportCertificatesRoutes = require('./routes/export-certificates');
const lotsRoutes = require('./routes/lots');
const graphqlRoutes = require('./routes/graphql');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../api/openapi.yaml');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ICGLR API Documentation'
}));

// OpenAPI specification endpoints
app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

app.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.send(fs.readFileSync(openApiPath, 'utf8'));
});

// Routes
app.use('/mine-sites', mineSitesRoutes);
app.use('/export-certificates', exportCertificatesRoutes);
app.use('/lots', lotsRoutes);
app.use('/graphql', graphqlRoutes);
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ICGLR Mining Sector Data Sharing Protocol API',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs',
      openapiJson: '/openapi.json',
      openapiYaml: '/openapi.yaml'
    },
    endpoints: {
      mineSites: '/mine-sites',
      exportCertificates: '/export-certificates',
      lots: '/lots',
      graphql: '/graphql',
      health: '/health'
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`✓ ICGLR API Server running on http://localhost:\${PORT}\`);
  console.log(\`  Swagger UI: http://localhost:\${PORT}/api-docs\`);
  console.log(\`  OpenAPI Spec: http://localhost:\${PORT}/openapi.json\`);
  console.log(\`  Health check: http://localhost:\${PORT}/health\`);
  console.log(\`  Mine Sites: http://localhost:\${PORT}/mine-sites\`);
  console.log(\`  Export Certificates: http://localhost:\${PORT}/export-certificates\`);
  console.log(\`  Lots: http://localhost:\${PORT}/lots\`);
});

module.exports = app;
`;

  fs.writeFileSync(path.join(outputDir, 'server.js'), server);
}


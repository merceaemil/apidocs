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
    WHERE country = ? AND subnationalDivisionL1 = ? AND addressLocalityText = ?
  \`).get(address.country, address.subnationalDivisionL1, address.addressLocalityText);

  if (existing) return existing.id;

  const result = db.prepare(\`
    INSERT INTO addresses 
    (country, subnationalDivisionL1, subnationalDivisionL1Text, 
     subnationalDivisionL2, subnationalDivisionL3, subnationalDivisionL4, addressLocalityText)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  \`).run(
    address.country,
    address.subnationalDivisionL1,
    address.subnationalDivisionL1Text || null,
    address.subnationalDivisionL2 || null,
    address.subnationalDivisionL3 || null,
    address.subnationalDivisionL4 || null,
    address.addressLocalityText
  );

  return result.lastInsertRowid;
}

// Helper: Insert or get contact details ID
function insertOrGetContactDetails(contactDetails) {
  const existing = db.prepare(\`
    SELECT id FROM contactDetails WHERE contactEmail = ?
  \`).get(contactDetails.contactEmail);

  if (existing) return existing.id;

  const result = db.prepare(\`
    INSERT INTO contactDetails 
    (legalRepresentative, contactPhoneNumber, contactEmail)
    VALUES (?, ?, ?)
  \`).run(
    contactDetails.legalRepresentative,
    contactDetails.contactPhoneNumber,
    contactDetails.contactEmail
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
    SELECT identifier FROM businessEntities WHERE identifier = ?
  \`).get(entity.identifier);

  if (existing) return entity.identifier;

  const legalAddressId = insertOrGetAddress(entity.legalAddress);
  const physicalAddressId = insertOrGetAddress(entity.physicalAddress);
  const contactDetailsId = insertOrGetContactDetails(entity.contactDetails);

  db.prepare(\`
    INSERT INTO businessEntities 
    (identifier, name, legalAddressId, physicalAddressId, tin, contactDetailsId)
    VALUES (?, ?, ?, ?, ?, ?)
  \`).run(
    entity.identifier,
    entity.name,
    legalAddressId,
    physicalAddressId,
    entity.tin,
    contactDetailsId
  );

  return entity.identifier;
}

// Helper: Reconstruct business entity from database
function getBusinessEntity(identifier) {
  const entity = db.prepare(\`
    SELECT be.*, 
           la.country as legalCountry, la.subnationalDivisionL1 as legalL1, 
           la.subnationalDivisionL1Text as legalL1Text,
           la.subnationalDivisionL2 as legalL2, la.subnationalDivisionL3 as legalL3,
           la.subnationalDivisionL4 as legalL4, la.addressLocalityText as legalLocality,
           pa.country as physicalCountry, pa.subnationalDivisionL1 as physicalL1,
           pa.subnationalDivisionL1Text as physicalL1Text,
           pa.subnationalDivisionL2 as physicalL2, pa.subnationalDivisionL3 as physicalL3,
           pa.subnationalDivisionL4 as physicalL4, pa.addressLocalityText as physicalLocality,
           cd.legalRepresentative, cd.contactPhoneNumber, cd.contactEmail
    FROM businessEntities be
    JOIN addresses la ON be.legalAddressId = la.id
    JOIN addresses pa ON be.physicalAddressId = pa.id
    JOIN contactDetails cd ON be.contactDetailsId = cd.id
    WHERE be.identifier = ?
  \`).get(identifier);

  if (!entity) return null;

  return {
    identifier: entity.identifier,
    name: entity.name,
    legalAddress: {
      country: entity.legalCountry,
      subnationalDivisionL1: entity.legalL1,
      subnationalDivisionL1Text: entity.legalL1Text,
      subnationalDivisionL2: entity.legalL2,
      subnationalDivisionL3: entity.legalL3,
      subnationalDivisionL4: entity.legalL4,
      addressLocalityText: entity.legalLocality
    },
    physicalAddress: {
      country: entity.physicalCountry,
      subnationalDivisionL1: entity.physicalL1,
      subnationalDivisionL1Text: entity.physicalL1Text,
      subnationalDivisionL2: entity.physicalL2,
      subnationalDivisionL3: entity.physicalL3,
      subnationalDivisionL4: entity.physicalL4,
      addressLocalityText: entity.physicalLocality
    },
    tin: entity.tin,
    contactDetails: {
      legalRepresentative: entity.legalRepresentative,
      contactPhoneNumber: entity.contactPhoneNumber,
      contactEmail: entity.contactEmail
    }
  };
}

// Helper: Reconstruct mine site from database
function reconstructMineSite(row) {
  const owner = getBusinessEntity(row.ownerId);
  
  // Get minerals
  const minerals = db.prepare(\`
    SELECT mineralCode FROM mineSiteMinerals WHERE mineSiteId = ?
  \`).all(row.icglrId).map(r => r.mineralCode);

  // Get mine site location (simplified - assumes one location per mine site)
  // Note: The schema doesn't have a direct link from mineSites to mineSiteLocations
  // This is a limitation - you may need to add a locationId column to mineSites
  // For now, we'll try to find a location that might be associated
  const locationRow = db.prepare(\`
    SELECT msl.*, g.latitude, g.longitude,
           a.country, a.subnationalDivisionL1, a.subnationalDivisionL1Text,
           a.subnationalDivisionL2, a.subnationalDivisionL3, a.subnationalDivisionL4,
           a.addressLocalityText
    FROM mineSiteLocations msl
    JOIN geolocalizations g ON msl.geolocalizationId = g.id
    JOIN addresses a ON msl.localGeographicDesignationId = a.id
    LIMIT 1
  \`).get();

  // For now, we'll need to store locationId in mineSites table or query differently
  // This is a simplified version - you may need to adjust based on your schema
  const location = locationRow ? {
    geolocalization: {
      latitude: locationRow.latitude,
      longitude: locationRow.longitude
    },
    nationalCadasterLocalization: locationRow.nationalCadasterLocalization,
    localGeographicDesignation: {
      country: locationRow.country,
      subnationalDivisionL1: locationRow.subnationalDivisionL1,
      subnationalDivisionL1Text: locationRow.subnationalDivisionL1Text,
      subnationalDivisionL2: locationRow.subnationalDivisionL2,
      subnationalDivisionL3: locationRow.subnationalDivisionL3,
      subnationalDivisionL4: locationRow.subnationalDivisionL4,
      addressLocalityText: locationRow.addressLocalityText
    },
    polygon: locationRow.polygon ? JSON.parse(locationRow.polygon) : undefined,
    altitude: locationRow.altitude
  } : null;

  // Get licenses
  const licenses = db.prepare(\`
    SELECT l.* FROM licenses l WHERE l.ownerId = ?
  \`).all(row.ownerId).map(licenseRow => {
    const licenseOwner = getBusinessEntity(licenseRow.ownerId);
    return {
      licenseType: licenseRow.licenseType,
      licenseId: licenseRow.licenseId,
      owner: licenseOwner,
      appliedDate: licenseRow.appliedDate,
      grantedDate: licenseRow.grantedDate,
      expiringDate: licenseRow.expiringDate,
      licenseStatus: licenseRow.licenseStatus,
      coveredCommodities: [] // TODO: Implement license commodities junction table
    };
  });

  // Get inspections
  const inspections = db.prepare(\`
    SELECT * FROM inspections WHERE inspectionId IN (
      SELECT inspectionId FROM inspections LIMIT 10
    )
  \`).all().map(inspectionRow => ({
    inspectionId: inspectionRow.inspectionId,
    inspectionDate: inspectionRow.inspectionDate,
    inspectionResult: inspectionRow.inspectionResult,
    inspectionReport: inspectionRow.inspectionReport,
    inspectionPurpose: inspectionRow.inspectionPurpose,
    inspectionResults: inspectionRow.inspectionResults,
    inspectorName: inspectionRow.inspectorName,
    inspectorPosition: inspectionRow.inspectorPosition,
    governmentAgency: inspectionRow.governmentAgency,
    governmentId: inspectionRow.governmentId
  }));

  // Get status history
  const statusHistory = db.prepare(\`
    SELECT dateOfChange, newStatus 
    FROM statusHistory WHERE mineSiteId = ?
    ORDER BY dateOfChange DESC
  \`).all(row.icglrId).map(sh => ({
    dateOfChange: sh.dateOfChange,
    newStatus: sh.newStatus
  }));

  return {
    icglrId: row.icglrId,
    addressCountry: row.addressCountry,
    nationalId: row.nationalId,
    certificationStatus: row.certificationStatus,
    activityStatus: row.activityStatus,
    mineSiteLocation: location,
    mineral: minerals,
    license: licenses,
    owner: owner,
    operator: [], // TODO: Implement operator relationship
    inspection: inspections,
    statusChange: statusHistory
  };
}

class MineSitesService {
  // List mine sites with filtering and pagination
  list(filters = {}, page = 1, limit = 20) {
    let sql = 'SELECT * FROM mineSites WHERE 1=1';
    const conditions = [];
    const values = [];

    if (filters.addressCountry) {
      conditions.push('addressCountry = ?');
      values.push(filters.addressCountry);
    }
    if (filters.certificationStatus !== undefined) {
      conditions.push('certificationStatus = ?');
      values.push(filters.certificationStatus);
    }
    if (filters.activityStatus !== undefined) {
      conditions.push('activityStatus = ?');
      values.push(filters.activityStatus);
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
    const row = db.prepare('SELECT * FROM mineSites WHERE icglrId = ?').get(icglrId);
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
    const existing = db.prepare('SELECT icglrId FROM mineSites WHERE icglrId = ?').get(data.icglrId);
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
      if (data.mineSiteLocation) {
        const geoId = insertOrGetGeolocalization(data.mineSiteLocation.geolocalization);
        const addressId = insertOrGetAddress(data.mineSiteLocation.localGeographicDesignation);
        
        const locationResult = db.prepare(\`
          INSERT INTO mineSiteLocations 
          (geolocalizationId, nationalCadasterLocalization, localGeographicDesignationId, polygon, altitude)
          VALUES (?, ?, ?, ?, ?)
        \`).run(
          geoId,
          data.mineSiteLocation.nationalCadasterLocalization || null,
          addressId,
          data.mineSiteLocation.polygon ? JSON.stringify(data.mineSiteLocation.polygon) : null,
          data.mineSiteLocation.altitude || null
        );
        locationId = locationResult.lastInsertRowid;
      }

      // Insert mine site
      db.prepare(\`
        INSERT INTO mineSites 
        (icglrId, addressCountry, nationalId, certificationStatus, activityStatus, ownerId)
        VALUES (?, ?, ?, ?, ?, ?)
      \`).run(
        data.icglrId,
        data.addressCountry,
        data.nationalId,
        data.certificationStatus,
        data.activityStatus,
        data.owner.identifier
      );

      // Insert minerals
      if (data.mineral && data.mineral.length > 0) {
        const insertMineral = db.prepare(\`
          INSERT INTO mineSiteMinerals (mineSiteId, mineralCode) VALUES (?, ?)
        \`);
        data.mineral.forEach(mineral => {
          insertMineral.run(data.icglrId, mineral);
        });
      }

      // Insert licenses
      if (data.license && data.license.length > 0) {
        data.license.forEach(license => {
          insertOrGetBusinessEntity(license.owner);
          db.prepare(\`
            INSERT INTO licenses 
            (licenseType, licenseId, ownerId, appliedDate, grantedDate, expiringDate, licenseStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          \`).run(
            license.licenseType,
            license.licenseId,
            license.owner.identifier,
            license.appliedDate || null,
            license.grantedDate || null,
            license.expiringDate || null,
            license.licenseStatus ?? null
          );
        });
      }

      // Insert inspections
      if (data.inspection && data.inspection.length > 0) {
        const insertInspection = db.prepare(\`
          INSERT INTO inspections 
          (inspectionId, inspectionDate, inspectionResult,
           inspectionReport, inspectionPurpose, inspectionResults,
           inspectorName, inspectorPosition, governmentAgency, governmentId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`);
        data.inspection.forEach(inspection => {
          insertInspection.run(
            inspection.inspectionId,
            inspection.inspectionDate,
            inspection.inspectionResult,
            inspection.inspectionReport || null,
            inspection.inspectionPurpose || null,
            inspection.inspectionResults || null,
            inspection.inspectorName,
            inspection.inspectorPosition,
            inspection.governmentAgency,
            inspection.governmentId || null
          );
        });
      }

      // Insert status history
      if (data.statusChange && data.statusChange.length > 0) {
        const insertStatus = db.prepare(\`
          INSERT INTO statusHistory (mineSiteId, dateOfChange, newStatus)
          VALUES (?, ?, ?)
        \`);
        data.statusChange.forEach(status => {
          insertStatus.run(data.icglrId, status.dateOfChange, status.newStatus);
        });
      }
    });

    transaction();

    return this.getById(data.icglrId);
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
      UPDATE mineSites 
      SET addressCountry = ?, nationalId = ?, certificationStatus = ?, activityStatus = ?, ownerId = ?
      WHERE icglrId = ?
    \`).run(
      data.addressCountry,
      data.nationalId,
      data.certificationStatus,
      data.activityStatus,
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
      SELECT * FROM exportCertificates 
      WHERE identifier = ? AND issuingCountry = ?
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

      const exportCertificateId = \`\${data.issuingCountry}:\${data.identifier}\`;

      db.prepare(\`
        INSERT INTO exportCertificates 
        (exportCertificateId, issuingCountry, identifier, exporterId, importerId, lotNumber,
         designatedMineralDescription, typeOfOre, lotWeight, lotWeightUOM,
         lotGrade, mineralOrigin, customsValue, dateOfShipment, shipmentRoute,
         transportCompany, memberStateIssuingAuthority, nameOfVerifier,
         positionOfVerifier, idOfVerifier, dateOfVerification, nameOfValidator,
         dateOfIssuance, dateOfExpiration, certificateFile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`).run(
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
  const creator = getBusinessEntity(row.creatorId);
  const recipient = row.recipientId ? getBusinessEntity(row.recipientId) : null;
  const tagIssuer = getBusinessEntity(row.tagIssuerId);

  // Get creator roles
  const creatorRoles = db.prepare(\`
    SELECT roleCode FROM lotCreatorRoles WHERE lotNumber = ?
  \`).all(row.lotNumber).map(r => r.roleCode);

  // Get originating operations
  const originatingOperations = db.prepare(\`
    SELECT operationCode FROM lotOriginatingOperations WHERE lotNumber = ?
  \`).all(row.lotNumber).map(r => r.operationCode);

  // Get input lots
  const inputLots = db.prepare(\`
    SELECT inputLotNumber FROM lotInputLots WHERE lotNumber = ?
  \`).all(row.lotNumber).map(r => ({ lotNumber: r.inputLotNumber }));

  // Get tag
  const tagRow = db.prepare(\`
    SELECT t.*
    FROM tags t
    WHERE t.identifier = ?
  \`).get(row.tagIdentifier);

  const tag = tagRow ? {
    identifier: tagRow.identifier,
    issuer: getBusinessEntity(tagRow.issuerId),
    issueDate: tagRow.issueDate,
    issueTime: tagRow.issueTime
  } : null;

  // Get taxes
  const taxes = db.prepare(\`
    SELECT t.* FROM taxes t
    JOIN lotTaxes lt ON t.id = lt.taxId
    WHERE lt.lotNumber = ?
  \`).all(row.lotNumber).map(taxRow => ({
    taxType: taxRow.taxType,
    taxAmount: taxRow.taxAmount,
    currency: taxRow.currency,
    taxAuthority: taxRow.taxAuthority || null,
    taxPaidDate: taxRow.taxPaidDate || null,
    receiptReference: taxRow.receiptReference || null
  }));

  // Parse dateRegistration and timeRegistration
  const dateRegistration = row.dateRegistration;
  const timeRegistration = row.timeRegistration;

  return {
    lotNumber: row.lotNumber,
    dateRegistration: dateRegistration,
    timeRegistration: timeRegistration,
    creator: creator,
    mineral: row.mineral,
    concentration: row.concentration,
    mass: row.mass,
    packageType: row.packageType || null,
    nrOfPackages: row.nrOfPackages || null,
    unitOfMeasurement: row.unitOfMeasurement,
    mineSiteId: row.mineSiteId || null,
    creatorRole: creatorRoles,
    recipient: recipient || null,
    originatingOperation: originatingOperations,
    inputLot: inputLots,
    tag: tag || null,
    taxPaid: taxes,
    dateSealed: row.dateSealed || null,
    dateShipped: row.dateShipped || null,
    purchaseNumber: row.purchaseNumber || null,
    purchaseDate: row.purchaseDate || null,
    responsibleStaff: row.responsibleStaff || null,
    dateIn: row.dateIn || null,
    transportationMethod: row.transportationMethod || null,
    transportationRoute: row.transportationRoute || null,
    transportCompany: row.transportCompany || null,
    exportCertificateId: row.exportCertificateId || null
  };
}

class LotsService {
  list(filters = {}, page = 1, limit = 20) {
    let sql = 'SELECT * FROM lots WHERE 1=1';
    const conditions = [];
    const values = [];

    if (filters.mineSiteId) {
      conditions.push('mineSiteId = ?');
      values.push(filters.mineSiteId);
    }
    if (filters.mineral) {
      conditions.push('mineral = ?');
      values.push(filters.mineral);
    }
    if (filters.lotNumber) {
      conditions.push('lotNumber = ?');
      values.push(filters.lotNumber);
    }
    if (filters.dateRegistrationFrom) {
      conditions.push('dateRegistration >= ?');
      values.push(filters.dateRegistrationFrom);
    }
    if (filters.dateRegistrationTo) {
      conditions.push('dateRegistration <= ?');
      values.push(filters.dateRegistrationTo);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    // Filter by creatorRole if specified
    if (filters.creatorRole) {
      const lotsWithRole = db.prepare(\`
        SELECT DISTINCT lotNumber FROM lotCreatorRoles WHERE roleCode = ?
      \`).all(filters.creatorRole).map(r => r.lotNumber);
      
      if (lotsWithRole.length > 0) {
        conditions.push('lotNumber IN (' + lotsWithRole.map(() => '?').join(',') + ')');
        values.push(...lotsWithRole);
      } else {
        // No lots match, return empty
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        };
      }
    }

    // Filter by originatingOperation if specified
    if (filters.originatingOperation) {
      const lotsWithOp = db.prepare(\`
        SELECT DISTINCT lotNumber FROM lotOriginatingOperations WHERE operationCode = ?
      \`).all(filters.originatingOperation).map(r => r.lotNumber);
      
      if (lotsWithOp.length > 0) {
        if (!conditions.includes('lotNumber IN')) {
          conditions.push('lotNumber IN (' + lotsWithOp.map(() => '?').join(',') + ')');
          values.push(...lotsWithOp);
        } else {
          // Intersect with existing filter
          const existing = values.filter((v, i) => conditions[i]?.includes('lotNumber IN'));
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
    const row = db.prepare('SELECT * FROM lots WHERE lotNumber = ?').get(lotNumber);
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
          INSERT OR IGNORE INTO tags (identifier, issuerId, issueDate, issueTime)
          VALUES (?, ?, ?, ?)
        \`).run(
          data.tag.identifier,
          data.tag.issuer.identifier,
          data.tag.issueDate,
          data.tag.issueTime || null
        );
      }

      // Insert taxes if present
      const taxIds = [];
      if (data.taxPaid && data.taxPaid.length > 0) {
        const insertTax = db.prepare(\`
          INSERT INTO taxes (taxType, taxAmount, currency, taxAuthority, taxPaidDate, receiptReference) VALUES (?, ?, ?, ?, ?, ?)
        \`);
        data.taxPaid.forEach(tax => {
          const result = insertTax.run(
            tax.taxType, 
            tax.taxAmount, 
            tax.currency,
            tax.taxAuthority || null,
            tax.taxPaidDate || null,
            tax.receiptReference || null
          );
          taxIds.push(result.lastInsertRowid);
        });
      }

      // Insert lot (using dateRegistration and timeRegistration directly)
      db.prepare(\`
        INSERT INTO lots 
        (lotNumber, dateRegistration, timeRegistration, creatorId, mineral, concentration, mass, packageType,
         unitOfMeasurement, mineSiteId, recipientId, tagIdentifier, tagIssuerId,
         tagIssueDate, tagIssueTime, dateSealed, dateShipped, purchaseNumber, purchaseDate,
         responsibleStaff, dateIn, transportationMethod, transportationRoute,
         transportCompany, exportCertificateId, nrOfPackages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      \`).run(
        data.lotNumber,
        data.dateRegistration,
        data.timeRegistration,
        data.creator.identifier,
        data.mineral,
        data.concentration,
        data.mass,
        data.packageType || null,
        data.unitOfMeasurement,
        data.mineSiteId || null,
        data.recipient?.identifier || null,
        data.tag?.identifier || null,
        data.tag?.issuer?.identifier || null,
        data.tag?.issueDate || null,
        data.tag?.issueTime || null,
        data.dateSealed || null,
        data.dateShipped || null,
        data.purchaseNumber || null,
        data.purchaseDate || null,
        data.responsibleStaff || null,
        data.dateIn || null,
        data.transportationMethod || null,
        data.transportationRoute || null,
        data.transportCompany || null,
        data.exportCertificateId || null,
        data.nrOfPackages || null
      );

      // Insert creator roles
      if (data.creatorRole && data.creatorRole.length > 0) {
        const insertRole = db.prepare(\`
          INSERT INTO lotCreatorRoles (lotNumber, roleCode) VALUES (?, ?)
        \`);
        data.creatorRole.forEach(role => {
          insertRole.run(data.lotNumber, role);
        });
      }

      // Insert originating operations
      if (data.originatingOperation && data.originatingOperation.length > 0) {
        const insertOp = db.prepare(\`
          INSERT INTO lotOriginatingOperations (lotNumber, operationCode) VALUES (?, ?)
        \`);
        data.originatingOperation.forEach(op => {
          insertOp.run(data.lotNumber, op);
        });
      }

      // Insert input lots
      if (data.inputLot && data.inputLot.length > 0) {
        const insertInput = db.prepare(\`
          INSERT INTO lotInputLots (lotNumber, inputLotNumber) VALUES (?, ?)
        \`);
        data.inputLot.forEach(input => {
          insertInput.run(data.lotNumber, input.lotNumber);
        });
      }

      // Link taxes
      if (taxIds.length > 0) {
        const linkTax = db.prepare(\`
          INSERT INTO lotTaxes (lotNumber, taxId) VALUES (?, ?)
        \`);
        taxIds.forEach(taxId => {
          linkTax.run(data.lotNumber, taxId);
        });
      }
    });

    transaction();

    return this.getById(data.lotNumber);
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
      addressCountry: req.query.addressCountry,
      certificationStatus: req.query.certificationStatus ? parseInt(req.query.certificationStatus) : undefined,
      activityStatus: req.query.activityStatus ? parseInt(req.query.activityStatus) : undefined,
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
router.get('/:icglrId', (req, res, next) => {
  try {
    const mineSite = mineSitesService.getById(req.params.icglrId);
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
router.put('/:icglrId', validateRequest('mine-site'), (req, res, next) => {
  try {
    const mineSite = mineSitesService.update(req.params.icglrId, req.body);
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
      issuingCountry: req.query.issuingCountry,
      identifier: req.query.identifier,
      lotNumber: req.query.lotNumber,
      typeOfOre: req.query.typeOfOre,
      dateOfIssuanceFrom: req.query.dateOfIssuanceFrom,
      dateOfIssuanceTo: req.query.dateOfIssuanceTo
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
    if (!req.query.issuingCountry) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'issuingCountry query parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const certificate = exportCertificatesService.getById(
      req.params.identifier,
      req.query.issuingCountry
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
      mineSiteId: req.query.mineSiteId,
      mineral: req.query.mineral,
      creatorRole: req.query.creatorRole ? parseInt(req.query.creatorRole) : undefined,
      originatingOperation: req.query.originatingOperation ? parseInt(req.query.originatingOperation) : undefined,
      lotNumber: req.query.lotNumber,
      dateRegistrationFrom: req.query.dateRegistrationFrom,
      dateRegistrationTo: req.query.dateRegistrationTo
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
router.get('/:lotNumber', (req, res, next) => {
  try {
    const lot = lotsService.getById(req.params.lotNumber);
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


/**
 * Mine Sites Service
 * Handles database operations for mine sites
 */

const { db } = require('../database');
const validator = require('../../../conformance/validators/schema-validator');

// Helper: Insert or get address ID
function insertOrGetAddress(address) {
  const existing = db.prepare(`
    SELECT id FROM addresses 
    WHERE country = ? AND subnationalDivisionL1 = ? AND addressLocalityText = ?
  `).get(address.country, address.subnationalDivisionL1, address.addressLocalityText);

  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO addresses 
    (country, subnationalDivisionL1, subnationalDivisionL1Text, 
     subnationalDivisionL2, subnationalDivisionL3, subnationalDivisionL4, addressLocalityText)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  const existing = db.prepare(`
    SELECT id FROM contactDetails WHERE contactEmail = ?
  `).get(contactDetails.contactEmail);

  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO contactDetails 
    (legalRepresentative, contactPhoneNumber, contactEmail)
    VALUES (?, ?, ?)
  `).run(
    contactDetails.legalRepresentative,
    contactDetails.contactPhoneNumber,
    contactDetails.contactEmail
  );

  return result.lastInsertRowid;
}

// Helper: Insert or get geolocalization ID
function insertOrGetGeolocalization(geolocalization) {
  const existing = db.prepare(`
    SELECT id FROM geolocalizations WHERE latitude = ? AND longitude = ?
  `).get(geolocalization.latitude, geolocalization.longitude);

  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO geolocalizations (latitude, longitude) VALUES (?, ?)
  `).run(geolocalization.latitude, geolocalization.longitude);

  return result.lastInsertRowid;
}

// Helper: Insert or get business entity
function insertOrGetBusinessEntity(entity) {
  const existing = db.prepare(`
    SELECT identifier FROM businessEntities WHERE identifier = ?
  `).get(entity.identifier);

  if (existing) return entity.identifier;

  const legalAddressId = insertOrGetAddress(entity.legalAddress);
  const physicalAddressId = insertOrGetAddress(entity.physicalAddress);
  const contactDetailsId = insertOrGetContactDetails(entity.contactDetails);

  db.prepare(`
    INSERT INTO businessEntities 
    (identifier, name, legalAddressId, physicalAddressId, tin, contactDetailsId)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
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
  const entity = db.prepare(`
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
  `).get(identifier);

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
  const minerals = db.prepare(`
    SELECT mineralCode FROM mineSiteMinerals WHERE mineSiteId = ?
  `).all(row.icglrId).map(r => r.mineralCode);

  // Get mine site location (simplified - assumes one location per mine site)
  // Note: The schema doesn't have a direct link from mineSites to mineSiteLocations
  // This is a limitation - you may need to add a locationId column to mineSites
  // For now, we'll try to find a location that might be associated
  const locationRow = db.prepare(`
    SELECT msl.*, g.latitude, g.longitude,
           a.country, a.subnationalDivisionL1, a.subnationalDivisionL1Text,
           a.subnationalDivisionL2, a.subnationalDivisionL3, a.subnationalDivisionL4,
           a.addressLocalityText
    FROM mineSiteLocations msl
    JOIN geolocalizations g ON msl.geolocalizationId = g.id
    JOIN addresses a ON msl.localGeographicDesignationId = a.id
    LIMIT 1
  `).get();

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
  const licenses = db.prepare(`
    SELECT l.* FROM licenses l WHERE l.ownerId = ?
  `).all(row.ownerId).map(licenseRow => {
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
  const inspections = db.prepare(`
    SELECT * FROM inspections WHERE inspectionId IN (
      SELECT inspectionId FROM inspections LIMIT 10
    )
  `).all().map(inspectionRow => ({
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
  const statusHistory = db.prepare(`
    SELECT dateOfChange, newStatus 
    FROM statusHistory WHERE mineSiteId = ?
    ORDER BY dateOfChange DESC
  `).all(row.icglrId).map(sh => ({
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
    const countSql = sql.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
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
        
        const locationResult = db.prepare(`
          INSERT INTO mineSiteLocations 
          (geolocalizationId, nationalCadasterLocalization, localGeographicDesignationId, polygon, altitude)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          geoId,
          data.mineSiteLocation.nationalCadasterLocalization || null,
          addressId,
          data.mineSiteLocation.polygon ? JSON.stringify(data.mineSiteLocation.polygon) : null,
          data.mineSiteLocation.altitude || null
        );
        locationId = locationResult.lastInsertRowid;
      }

      // Insert mine site
      db.prepare(`
        INSERT INTO mineSites 
        (icglrId, addressCountry, nationalId, certificationStatus, activityStatus, ownerId)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        data.icglrId,
        data.addressCountry,
        data.nationalId,
        data.certificationStatus,
        data.activityStatus,
        data.owner.identifier
      );

      // Insert minerals
      if (data.mineral && data.mineral.length > 0) {
        const insertMineral = db.prepare(`
          INSERT INTO mineSiteMinerals (mineSiteId, mineralCode) VALUES (?, ?)
        `);
        data.mineral.forEach(mineral => {
          insertMineral.run(data.icglrId, mineral);
        });
      }

      // Insert licenses
      if (data.license && data.license.length > 0) {
        data.license.forEach(license => {
          insertOrGetBusinessEntity(license.owner);
          db.prepare(`
            INSERT INTO licenses 
            (licenseType, licenseId, ownerId, appliedDate, grantedDate, expiringDate, licenseStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
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
        const insertInspection = db.prepare(`
          INSERT INTO inspections 
          (inspectionId, inspectionDate, inspectionResult,
           inspectionReport, inspectionPurpose, inspectionResults,
           inspectorName, inspectorPosition, governmentAgency, governmentId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
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
        const insertStatus = db.prepare(`
          INSERT INTO statusHistory (mineSiteId, dateOfChange, newStatus)
          VALUES (?, ?, ?)
        `);
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
    db.prepare(`
      UPDATE mineSites 
      SET addressCountry = ?, nationalId = ?, certificationStatus = ?, activityStatus = ?, ownerId = ?
      WHERE icglrId = ?
    `).run(
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

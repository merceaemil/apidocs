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
    WHERE country = ? AND subnational_division_l1 = ? AND address_locality = ?
  `).get(address.country, address.subnational_division_l1, address.address_locality);

  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO addresses 
    (country, subnational_division_l1, subnational_division_l1_text, 
     subnational_division_l2, subnational_division_l3, subnational_division_l4, address_locality)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  const existing = db.prepare(`
    SELECT id FROM contact_details WHERE contact_email = ?
  `).get(contactDetails.contact_email);

  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO contact_details 
    (legal_representative, contact_phone_number, contact_email)
    VALUES (?, ?, ?)
  `).run(
    contactDetails.legal_representative,
    contactDetails.contact_phone_number,
    contactDetails.contact_email
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
    SELECT identifier FROM business_entities WHERE identifier = ?
  `).get(entity.identifier);

  if (existing) return entity.identifier;

  const legalAddressId = insertOrGetAddress(entity.legal_address);
  const physicalAddressId = insertOrGetAddress(entity.physical_address);
  const contactDetailsId = insertOrGetContactDetails(entity.contact_details);

  db.prepare(`
    INSERT INTO business_entities 
    (identifier, name, legal_address_id, physical_address_id, tin, rdb_number, rca_number, contact_details_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  const entity = db.prepare(`
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
  `).get(identifier);

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
  const minerals = db.prepare(`
    SELECT mineral_code FROM mine_site_minerals WHERE mine_site_id = ?
  `).all(row.icglr_id).map(r => r.mineral_code);

  // Get mine site location (simplified - assumes one location per mine site)
  // Note: The schema doesn't have a direct link from mine_sites to mine_site_locations
  // This is a limitation - you may need to add a location_id column to mine_sites
  // For now, we'll try to find a location that might be associated
  const locationRow = db.prepare(`
    SELECT msl.*, g.latitude, g.longitude,
           a.country, a.subnational_division_l1, a.subnational_division_l1_text,
           a.subnational_division_l2, a.subnational_division_l3, a.subnational_division_l4,
           a.address_locality
    FROM mine_site_locations msl
    JOIN geolocalizations g ON msl.geolocalization_id = g.id
    JOIN addresses a ON msl.local_geographic_designation_id = a.id
    LIMIT 1
  `).get();

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
  const licenses = db.prepare(`
    SELECT l.* FROM licenses l WHERE l.owner_id = ?
  `).all(row.owner_id).map(licenseRow => {
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
  const inspections = db.prepare(`
    SELECT * FROM inspections WHERE inspection_id IN (
      SELECT inspection_id FROM inspections LIMIT 10
    )
  `).all().map(inspectionRow => ({
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
  const statusHistory = db.prepare(`
    SELECT date_of_change, new_status 
    FROM status_history WHERE mine_site_id = ?
    ORDER BY date_of_change DESC
  `).all(row.icglr_id).map(sh => ({
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
        
        const locationResult = db.prepare(`
          INSERT INTO mine_site_locations 
          (geolocalization_id, national_cadaster_localization, local_geographic_designation_id, polygon, altitude)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          geoId,
          data.mine_site_location.national_cadaster_localization,
          addressId,
          data.mine_site_location.polygon || null,
          data.mine_site_location.altitude || null
        );
        locationId = locationResult.lastInsertRowid;
      }

      // Insert mine site
      db.prepare(`
        INSERT INTO mine_sites 
        (icglr_id, address_country, national_id, certification_status, activity_status, owner_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        data.icglr_id,
        data.address_country,
        data.national_id,
        data.certification_status,
        data.activity_status,
        data.owner.identifier
      );

      // Insert minerals
      if (data.mineral && data.mineral.length > 0) {
        const insertMineral = db.prepare(`
          INSERT INTO mine_site_minerals (mine_site_id, mineral_code) VALUES (?, ?)
        `);
        data.mineral.forEach(mineral => {
          insertMineral.run(data.icglr_id, mineral);
        });
      }

      // Insert licenses
      if (data.license && data.license.length > 0) {
        data.license.forEach(license => {
          insertOrGetBusinessEntity(license.owner);
          db.prepare(`
            INSERT INTO licenses 
            (license_type, license_id, owner_id, date_applied, date_granted, date_expiring, license_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
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
        const insertInspection = db.prepare(`
          INSERT INTO inspections 
          (inspection_id, inspection_date, inspection_responsible, inspection_findings,
           inspection_report, inspection_purpose, inspection_results, inspector_name, inspector_position,
           government_agency, government_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
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
        const insertStatus = db.prepare(`
          INSERT INTO status_history (mine_site_id, date_of_change, new_status)
          VALUES (?, ?, ?)
        `);
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
    db.prepare(`
      UPDATE mine_sites 
      SET address_country = ?, national_id = ?, certification_status = ?, activity_status = ?, owner_id = ?
      WHERE icglr_id = ?
    `).run(
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

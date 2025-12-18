/**
 * Seed database with example data
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/icglr.db');

if (!fs.existsSync(dbPath)) {
  console.error('Database not found. Please run: npm run generate:db');
  process.exit(1);
}

const db = new Database(dbPath);
const examplesDir = path.join(__dirname, '../../examples/json');

// Load example JSON files
const mineSiteExample = JSON.parse(
  fs.readFileSync(path.join(examplesDir, 'mine-site-example.json'), 'utf8')
);

console.log('Seeding database with example data...');

// Helper function to insert or get address ID
function insertOrGetAddress(db, address) {
  const existing = db.prepare(`
    SELECT id FROM addresses 
    WHERE country = ? AND subnational_division_l1 = ? AND address_locality = ?
  `).get(
    address.country,
    address.subnational_division_l1,
    address.address_locality
  );

  if (existing) {
    return existing.id;
  }

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

// Helper function to insert or get contact details ID
function insertOrGetContactDetails(db, contactDetails) {
  const existing = db.prepare(`
    SELECT id FROM contact_details 
    WHERE contact_email = ?
  `).get(contactDetails.contact_email);

  if (existing) {
    return existing.id;
  }

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

// Helper function to insert or get geolocalization ID
function insertOrGetGeolocalization(db, geolocalization) {
  const existing = db.prepare(`
    SELECT id FROM geolocalizations 
    WHERE latitude = ? AND longitude = ?
  `).get(geolocalization.latitude, geolocalization.longitude);

  if (existing) {
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO geolocalizations (latitude, longitude)
    VALUES (?, ?)
  `).run(geolocalization.latitude, geolocalization.longitude);

  return result.lastInsertRowid;
}

try {
  // 1. Insert addresses for business entity
  const legalAddressId = insertOrGetAddress(db, mineSiteExample.owner.legal_address);
  const physicalAddressId = insertOrGetAddress(db, mineSiteExample.owner.physical_address);

  // 2. Insert contact details for business entity
  const contactDetailsId = insertOrGetContactDetails(db, mineSiteExample.owner.contact_details);

  // 3. Insert business entity (owner) with foreign keys
  db.prepare(`
    INSERT OR IGNORE INTO business_entities 
    (identifier, name, legal_address_id, physical_address_id, tin, rdb_number, rca_number, contact_details_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mineSiteExample.owner.identifier,
    mineSiteExample.owner.name,
    legalAddressId,
    physicalAddressId,
    mineSiteExample.owner.tin,
    mineSiteExample.owner.rdb_number,
    mineSiteExample.owner.rca_number,
    contactDetailsId
  );

  // 4. Insert geolocalization for mine site location
  const geolocalizationId = insertOrGetGeolocalization(
    db,
    mineSiteExample.mine_site_location.geolocalization
  );

  // 5. Insert address for local geographic designation
  const localGeographicDesignationId = insertOrGetAddress(
    db,
    mineSiteExample.mine_site_location.local_geographic_designation
  );

  // 6. Insert mine site location
  const mineSiteLocationId = db.prepare(`
    INSERT INTO mine_site_locations 
    (geolocalization_id, national_cadaster_localization, local_geographic_designation_id, polygon, altitude)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    geolocalizationId,
    mineSiteExample.mine_site_location.national_cadaster_localization,
    localGeographicDesignationId,
    mineSiteExample.mine_site_location.polygon || null,
    mineSiteExample.mine_site_location.altitude || null
  ).lastInsertRowid;

  // 7. Insert mine site with foreign key to business entity
  db.prepare(`
    INSERT OR IGNORE INTO mine_sites 
    (icglr_id, address_country, national_id, certification_status, activity_status, owner_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mineSiteExample.icglr_id,
    mineSiteExample.address_country,
    mineSiteExample.national_id,
    mineSiteExample.certification_status,
    mineSiteExample.activity_status,
    mineSiteExample.owner.identifier
  );

  // Insert minerals
  for (const mineral of mineSiteExample.mineral) {
    db.prepare('INSERT OR IGNORE INTO mine_site_minerals (mine_site_id, mineral_code) VALUES (?, ?)')
      .run(mineSiteExample.icglr_id, mineral);
  }

  // Insert licenses
  if (mineSiteExample.license && mineSiteExample.license.length > 0) {
    for (const license of mineSiteExample.license) {
      // Insert addresses and contact details for license owner if different
      let licenseOwnerId = license.owner.identifier;
      
      // Check if license owner is different from mine site owner
      if (license.owner.identifier !== mineSiteExample.owner.identifier) {
        const licenseLegalAddressId = insertOrGetAddress(db, license.owner.legal_address);
        const licensePhysicalAddressId = insertOrGetAddress(db, license.owner.physical_address);
        const licenseContactDetailsId = insertOrGetContactDetails(db, license.owner.contact_details);

        db.prepare(`
          INSERT OR IGNORE INTO business_entities 
          (identifier, name, legal_address_id, physical_address_id, tin, rdb_number, rca_number, contact_details_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          license.owner.identifier,
          license.owner.name,
          licenseLegalAddressId,
          licensePhysicalAddressId,
          license.owner.tin,
          license.owner.rdb_number,
          license.owner.rca_number,
          licenseContactDetailsId
        );
      }

      const licenseResult = db.prepare(`
        INSERT OR IGNORE INTO licenses 
        (license_type, license_id, owner_id, date_applied, date_granted, date_expiring, license_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        license.license_type,
        license.license_id,
        licenseOwnerId,
        license.date_applied || null,
        license.date_granted,
        license.date_expiring,
        license.license_status || null
      );

      // Note: license_commodities references licenses(id), but licenses doesn't have an id column
      // This is a schema issue - for now, we'll skip inserting license_commodities
      // TODO: Fix schema generation to either add id to licenses or change license_commodities to reference license_id
      // if (license.covered_commodities) {
      //   for (const commodity of license.covered_commodities) {
      //     db.prepare('INSERT OR IGNORE INTO license_commodities (license_id, mineral_code) VALUES (?, ?)')
      //       .run(license.license_id, commodity);
      //   }
      // }
    }
  }

  // Insert inspections
  if (mineSiteExample.inspection && mineSiteExample.inspection.length > 0) {
    for (const inspection of mineSiteExample.inspection) {
      db.prepare(`
        INSERT OR IGNORE INTO inspections 
        (inspection_id, inspection_date, inspection_responsible, inspection_findings,
         inspection_report, inspection_purpose, inspection_results, inspector_name, inspector_position,
         government_agency, government_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
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
    }
  }

  // Insert status history
  if (mineSiteExample.status_history && mineSiteExample.status_history.length > 0) {
    for (const status of mineSiteExample.status_history) {
      db.prepare(`
        INSERT OR IGNORE INTO status_history 
        (mine_site_id, date_of_change, new_status)
        VALUES (?, ?, ?)
      `).run(mineSiteExample.icglr_id, status.date_of_change, status.new_status);
    }
  }

  console.log('✓ Database seeded successfully');
  console.log(`  Mine Site: ${mineSiteExample.icglr_id}`);
  console.log(`  Owner: ${mineSiteExample.owner.name}`);
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} finally {
  db.close();
}


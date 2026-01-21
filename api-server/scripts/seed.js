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
    WHERE country = ? AND subnationalDivisionL1 = ? AND addressLocalityText = ?
  `).get(
    address.country,
    address.subnationalDivisionL1,
    address.addressLocalityText
  );

  if (existing) {
    return existing.id;
  }

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

// Helper function to insert or get contact details ID
function insertOrGetContactDetails(db, contactDetails) {
  const existing = db.prepare(`
    SELECT id FROM contactDetails 
    WHERE contactEmail = ?
  `).get(contactDetails.contactEmail);

  if (existing) {
    return existing.id;
  }

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
  const legalAddressId = insertOrGetAddress(db, mineSiteExample.owner.legalAddress);
  const physicalAddressId = insertOrGetAddress(db, mineSiteExample.owner.physicalAddress);

  // 2. Insert contact details for business entity
  const contactDetailsId = insertOrGetContactDetails(db, mineSiteExample.owner.contactDetails);

  // 3. Insert business entity (owner) with foreign keys
  db.prepare(`
    INSERT OR IGNORE INTO businessEntities 
    (identifier, name, legalAddressId, physicalAddressId, tin, rdbNumber, rcaNumber, contactDetailsId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mineSiteExample.owner.identifier,
    mineSiteExample.owner.name,
    legalAddressId,
    physicalAddressId,
    mineSiteExample.owner.tin,
    mineSiteExample.owner.rdbNumber || null,
    mineSiteExample.owner.rcaNumber || null,
    contactDetailsId
  );

  // 4. Insert geolocalization for mine site location
  const geolocalizationId = insertOrGetGeolocalization(
    db,
    mineSiteExample.mineSiteLocation.geolocalization
  );

  // 5. Insert address for local geographic designation
  const localGeographicDesignationId = insertOrGetAddress(
    db,
    mineSiteExample.mineSiteLocation.localGeographicDesignation
  );

  // 6. Insert mine site location
  const mineSiteLocationId = db.prepare(`
    INSERT INTO mineSiteLocations 
    (geolocalizationId, nationalCadasterLocalization, localGeographicDesignationId, polygon, altitude)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    geolocalizationId,
    mineSiteExample.mineSiteLocation.nationalCadasterLocalization || null,
    localGeographicDesignationId,
    mineSiteExample.mineSiteLocation.polygon ? JSON.stringify(mineSiteExample.mineSiteLocation.polygon) : null,
    mineSiteExample.mineSiteLocation.altitude || null
  ).lastInsertRowid;

  // 7. Insert mine site with foreign key to business entity
  db.prepare(`
    INSERT OR IGNORE INTO mineSites 
    (icglrId, addressCountry, nationalId, certificationStatus, activityStatus, ownerId)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mineSiteExample.icglrId,
    mineSiteExample.addressCountry,
    mineSiteExample.nationalId,
    mineSiteExample.certificationStatus,
    mineSiteExample.activityStatus,
    mineSiteExample.owner.identifier
  );

  // Insert minerals
  for (const mineral of mineSiteExample.mineral) {
    db.prepare('INSERT OR IGNORE INTO mineSiteMinerals (mineSiteId, mineralCode) VALUES (?, ?)')
      .run(mineSiteExample.icglrId, mineral);
  }

  // Insert licenses
  if (mineSiteExample.license && mineSiteExample.license.length > 0) {
    for (const license of mineSiteExample.license) {
      // Insert addresses and contact details for license owner if different
      let licenseOwnerId = license.owner.identifier;
      
      // Check if license owner is different from mine site owner
      if (license.owner.identifier !== mineSiteExample.owner.identifier) {
        const licenseLegalAddressId = insertOrGetAddress(db, license.owner.legalAddress);
        const licensePhysicalAddressId = insertOrGetAddress(db, license.owner.physicalAddress);
        const licenseContactDetailsId = insertOrGetContactDetails(db, license.owner.contactDetails);

        db.prepare(`
          INSERT OR IGNORE INTO businessEntities 
          (identifier, name, legalAddressId, physicalAddressId, tin, rdbNumber, rcaNumber, contactDetailsId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          license.owner.identifier,
          license.owner.name,
          licenseLegalAddressId,
          licensePhysicalAddressId,
          license.owner.tin,
          license.owner.rdbNumber || null,
          license.owner.rcaNumber || null,
          licenseContactDetailsId
        );
      }

      const licenseResult = db.prepare(`
        INSERT OR IGNORE INTO licenses 
        (licenseType, licenseId, ownerId, appliedDate, grantedDate, expiringDate, licenseStatus)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        license.licenseType,
        license.licenseId,
        licenseOwnerId,
        license.appliedDate || null,
        license.grantedDate || null,
        license.expiringDate || null,
        license.licenseStatus || null
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
        (inspectionId, inspectionDate, inspectionResult,
         inspectionReport, inspectionPurpose, inspectionResults,
         inspectorName, inspectorPosition, governmentAgency, governmentId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
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
    }
  }

  // Insert status history
  if (mineSiteExample.statusChange && mineSiteExample.statusChange.length > 0) {
    for (const status of mineSiteExample.statusChange) {
      db.prepare(`
        INSERT OR IGNORE INTO statusHistory 
        (mineSiteId, dateOfChange, newStatus)
        VALUES (?, ?, ?)
      `).run(mineSiteExample.icglrId, status.dateOfChange, status.newStatus);
    }
  }

  console.log('✓ Database seeded successfully');
  console.log(`  Mine Site: ${mineSiteExample.icglrId}`);
  console.log(`  Owner: ${mineSiteExample.owner.name}`);
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} finally {
  db.close();
}


# Migration to camelCase - Breaking Changes

## Overview

The NEWDOCUMENTATION.txt specifies that the standard now uses **camelCase** instead of **snake_case** for all technical terms. This is a breaking change that affects the entire project.

## Key Changes

### 1. Naming Convention Change
- **OLD**: `snake_case` (e.g., `icglr_id`, `certification_status`)
- **NEW**: `camelCase` (e.g., `icglrId`, `certificationStatus`)

### 2. Field Name Changes

#### Mine Site (MD.01)
- `icglr_id` → `icglrId`
- `address_country` → `addressCountry`
- `national_id` → `nationalId`
- `certification_status` → `certificationStatus`
- `activity_status` → `activityStatus`
- `mine_site_location` → `mineSiteLocation`
- `status_history` → `statusChange` (array)

#### License (MD.02)
- `license_type` → `licenseType`
- `license_id` → `licenseId`
- `date_applied` → `appliedDate`
- `date_granted` → `grantedDate`
- `date_expiring` → `expiringDate`
- `license_status` → `licenseStatus` (Integer: 1=Active, 0=Non-Active)
- `covered_commodities` → `coveredCommodities`

#### Export Certificate (MD.03)
- `issuing_country` → `issuingCountry`
- `lot_number` → `lotNumber`
- `designated_mineral_description` → `designatedMineralDescription` (0..1, optional)
- `type_of_ore` → `typeOfOre`
- `lot_weight` → `lotWeight`
- `lot_weight_uom` → `lotWeightUOM` (references MDC.07)
- `lot_grade` → `lotGrade`
- `mineral_origin` → `mineralOrigin` (separator: semicolon `;` not space)
- `customs_value` → `customsValue`
- `date_of_shipment` → `dateOfShipment`
- `shipment_route` → `shipmentRoute` (separator: semicolon `;`)
- `transport_company` → `transportCompany`
- `member_state_issuing_authority` → `memberStateIssuingAuthority`
- `name_of_verifier` → `nameOfVerifier`
- `position_of_verifier` → `positionOfVerifier`
- `id_of_verifier` → `idOfVerifier`
- `date_of_verification` → `dateOfVerification`
- `name_of_validator` → `nameOfValidator`
- `date_of_issuance` → `dateOfIssuance`
- `date_of_expiration` → `dateOfExpiration`
- `certificate_file` → `certificateFile`

#### Business Entity (MD.04)
- `legal_address` → `legalAddress` (0..1, optional)
- `physical_address` → `physicalAddress` (0..1, optional)
- `rdb_number` → `rdbNumber`
- `rca_number` → `rcaNumber`
- `business_type` → `contactDetails` (1..1, required)
- **Rule**: Either Legal Address or Physical Address should exist

#### Address (MD.05)
- `subnational_division_l1` → `subnationalDivisionL1` (0..1, optional)
- `subnational_division_l1_text` → `subnationalDivisionL1Text` (0..1)
- `subnational_division_l2` → `subnationalDivisionL2` (0..1)
- `subnational_division_l3` → `subnationalDivisionL3` (0..1)
- `subnational_division_l4` → `subnationalDivisionL4` (0..1)
- `address_locality` → `addressLocalityText` (1..1, required) + `addressLocalityCode` (0..1, optional)

#### Inspection (MD.07)
- `inspection_id` → `inspectionId`
- `inspection_date` → `inspectionDate`
- `inspection_findings` → `inspectionResult` (note: typo in documentation - "inpection" not "inspection")
- `inspection_report` → `inspectionReport` (0..1, optional)
- `inspection_purpose` → `inspectionPurpose` (0..1, optional)
- `inspection_results` → `inspectionResults` (0..1, optional)
- `inspector_name` → `inspectorName`
- `inspector_position` → `inspectorPosition`
- `government_agency` → `governmentAgency`
- `government_id` → `governmentId` (0..1, optional)

#### Mine Site Location (MD.08)
- `geolocalization` → `geolocalization` (same)
- `national_cadaster_localization` → `nationalCadasterLocalization` (0..1, optional)
- `local_geographic_designation` → `localGeographicDesignation` (0..1, optional)
- `polygon` → `polygon` (GeoJSON format)
- `altitude` → `altitude` (0..1, optional)

#### Contact Details (MD.09)
- `legal_representative` → `legalRepresentative`
- `contact_phone_number` → `contactPhoneNumber` (1..n, array, E.164 format)
- `contact_email` → `contactEmail`

#### Status History (MD.10)
- `date_of_change` → `dateOfChange`
- `new_status` → `newStatus`

#### Tag (MD.11)
- `issue_date` → `issueDate`
- `issue_time` → `issueTime` (Time format: hhmmss, not HH:mm:ss)

#### Lot (MD.12)
- `lot_number` → `lotNumber`
- `timestamp` → `dateRegistration` (Date) + `timeRegistration` (Time, hhmmss format)
- `package_type` → `packageType`
- `unit_of_measurement` → `unitOfMeasurement` (references MDC.07)
- `mine_site_id` → `mineSiteId`
- `creator_role` → `creatorRole`
- `originating_operation` → `originatingOperation`
- `input_lot` → `inputLot`
- `tax_paid` → `taxPaid`
- `date_sealed` → `dateSealed`
- `date_shipped` → `dateShipped`
- `purchase_number` → `purchaseNumber`
- `purchase_date` → `purchaseDate`
- `responsible_staff` → `responsibleStaff`
- `date_in` → `dateIn`
- `transportation_method` → `transportationMethod`
- `transportation_route` → `transportationRoute`
- `transport_company` → `transportCompany`
- `export_certificate_id` → `exportCertificateId`
- **NEW**: `nrOfPackages` (0..1, Number of packages)

#### Tax (MD.13)
- `tax_type` → `taxType`
- `tax_amount` → `taxAmount`
- `currency` → `currency` (String restricted to ISO 4217)
- **NEW**: `taxAuthority` (0..1, Authority who imposed the tax)
- **NEW**: `taxPaidDate` (0..1, Date when the tax was paid)
- **NEW**: `receiptReference` (0..1, Receipt number or other form of reference)

### 3. Code List Changes

#### MDC.03 Mineral
- **PRIMARY**: HS Codes (not IMA codes)
- Gold: `7108.12.00`
- Cassiterite: `2609.00.00`
- Wolframite: `2611.00.00`
- Columbite-Tantalite (coltan): `2615.90.00`

#### NEW: MDC.07 Unit of Measurement
- `TNE` - tonne
- `KGM` - kilogram

### 4. Format Changes

#### Time Format
- **OLD**: `HH:mm:ss` (e.g., `14:30:00`)
- **NEW**: `hhmmss` (e.g., `143000`)

#### Mineral Origin Separator
- **OLD**: Space-separated (e.g., `CD BI RW`)
- **NEW**: Semicolon-separated (e.g., `CD;BI;RW`)
- **NEW**: Can use `0` for unknown origin (e.g., `CD;BI;0`)

#### Shipment Route Separator
- **OLD**: Comma-separated (e.g., `CD, TZ, BI`)
- **NEW**: Semicolon-separated (e.g., `CD;TZ;BI`)

#### Polygon Format
- GeoJSON format: `{"type":"Polygon","coordinates":[[[longitude,latitude],...]]}`

### 5. Cardinality Changes

#### License (MD.02)
- `licenseId`: 0..1 (was 1..1) - Can miss only if license type is "unlicensed"
- `owner`: 0..1 (was 1..1) - Can miss only if license type is "unlicensed"
- `appliedDate`: 0..1 (was 0..1) - Same
- `grantedDate`: 0..1 (was 0..1) - Same
- `expiringDate`: 0..1 (was 0..1) - Same
- `licenseStatus`: 0..1 (was 0..1) - Integer (1=Active, 0=Non-Active)

#### Business Entity (MD.04)
- `legalAddress`: 0..1 (was 1..1) - Optional
- `physicalAddress`: 0..1 (was 1..1) - Optional
- **Rule**: Either Legal Address or Physical Address should exist

#### Address (MD.05)
- `subnationalDivisionL1`: 0..1 (was 1..1) - Optional
- `addressLocalityText`: 1..1 (required)
- `addressLocalityCode`: 0..1 (new, optional)

#### Mine Site Location (MD.08)
- `nationalCadasterLocalization`: 0..1 (was 1..1) - Optional
- `localGeographicDesignation`: 0..1 (was 1..1) - Optional

#### Contact Details (MD.09)
- `contactPhoneNumber`: 1..1 - String, E.164 format

#### Export Certificate (MD.03)
- `designatedMineralDescription`: 0..1 (was 1..1) - Optional

#### Inspection (MD.07)
- `inspectionReport`: 0..1 (was 1..1) - Optional
- `inspectionPurpose`: 0..1 (was 1..1) - Optional
- `inspectionResults`: 0..1 (was 1..1) - Optional

## Files to Update

1. ✅ All JSON schemas in `schemas/`
2. ✅ OpenAPI specification in `api/openapi.yaml`
3. ✅ Code generation scripts in `api-server/scripts/`
4. ✅ Example JSON files in `examples/json/`
5. ✅ Documentation files (README, COMPLETE_DOCUMENTATION.md, etc.)
6. ✅ Conformance rules in `conformance/rules.md`
7. ✅ Validation tools

## Migration Strategy

1. Update core/common.json first (definitions)
2. Update entity schemas
3. Update OpenAPI specification
4. Update examples
5. Update documentation
6. Update code generation scripts
7. Regenerate API server

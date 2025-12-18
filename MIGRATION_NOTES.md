# Migration Notes - Alignment with Semantic Model

## Overview

All components have been updated to align with the ICGLR Data Sharing Protocol Standards semantic model as defined in `DOCUMENTATION.txt`.

## Key Changes

### 1. Entity Names Changed

**Old → New:**
- `MiningOperation` → `MineSite` (MD.01)
- `Production` → Removed (not a primary entity in semantic model)
- `ComplianceReport` → Removed (not in semantic model)
- `EnvironmentalImpact` → Removed (not in semantic model)

**New Primary Entities:**
- `MineSite` (MD.01)
- `ExportCertificate` (MD.03)
- `Lot` (MD.12) - Central to Chain of Custody

**New Secondary Entities:**
- `License` (MD.02)
- `BusinessEntity` (MD.04)
- `Address` (MD.05)
- `Geolocalization` (MD.06)
- `Inspection` (MD.07)
- `MineSiteLocation` (MD.08)
- `ContactDetails` (MD.09)
- `StatusHistory` (MD.10)
- `Tag` (MD.11)
- `Tax` (MD.13)

### 2. Naming Convention

All technical terms now use **snake_case** as specified in the semantic model documentation (line 214).

Examples:
- `icglrId` → `icglr_id`
- `addressCountry` → `address_country`
- `certificationStatus` → `certification_status`
- `mineSiteLocation` → `mine_site_location`

### 3. Code Lists (Value Sets)

**Certification Status (MDC.01):**
- Uses integer codes: 0=Blue, 1=Green, 2=Yellow, 3=Red
- Not text values (language-independent)

**Mining Activity Status (MDC.02):**
- Uses integer codes: 0=Abandoned, 1=Active, 2=Non-active

**Mineral (MDC.03):**
- Uses HS Codes or IMA Codes
- Designated minerals:
  - `7108.12.00` / `IMA1960-A` - Gold
  - `2609.00.00` / `IMA1960-001` - Cassiterite
  - `2611.00.00` / `IMA2000-014` - Wolframite
  - `2615.90.00` / `IMA1979-A` - Coltan

**License Type (MDC.04):**
- Values: `claim`, `exploration_permit`, `mining_license`, `artisanal_permit`, `unlicensed`, `other`

**CoC Roles (MDC.05):**
- Integer codes: 1=Miner, 2=Trader, 3=Shipper, 4=Processor, 5=Warehouse, 6=Importer, 7=Exporter, 8=Government

**Originating Operations (MDC.06):**
- Integer codes: 1=Production, 2=Purchase, 3=Combination, 4=Processing, 5=Transportation, 6=Storage/Warehousing, 7=Import, 8=Export

### 4. Mine Site ID Format

**New Format:** `CC-[Lat]-[Long]-NNNNN`

Example: `RW-1.9641+30.0619-12345`
- CC: Country code (ISO 3166-1 alpha-2)
- [Lat]: Latitude with 4 decimals, no cardinal point
- [Long]: Longitude with 4 decimals, no cardinal point
- NNNNN: Sequential number

### 5. Schema Structure Changes

**Mine Site:**
- Primary entity (MD.01)
- Includes: icglr_id, address_country, national_id, certification_status, activity_status, mine_site_location, mineral (array), license (array), owner, operator (array), inspection (array), status_history (array)

**Export Certificate:**
- Primary entity (MD.03)
- Comprehensive structure matching RCM requirements
- Includes exporter, importer, lot information, verification details, etc.

**Lot:**
- Primary entity (MD.12)
- Central to Chain of Custody
- Supports all CoC operations (Production, Purchase, Combination, Processing, etc.)
- Includes recursive input_lot references for lot transformations

### 6. Removed Entities

The following entities from the initial implementation are not in the semantic model:
- Production (as separate entity - production data is part of Lot)
- ComplianceReport (not in semantic model)
- EnvironmentalImpact (not in semantic model)

These may be added as extensions in the future if needed.

## Updated Files

### Schemas
- ✅ `schemas/core/common.json` - Updated with correct definitions
- ✅ `schemas/mine-site/mine-site.json` - New, matches MD.01
- ✅ `schemas/mine-site/license.json` - New, matches MD.02
- ✅ `schemas/mine-site/mine-site-location.json` - New, matches MD.08
- ✅ `schemas/mine-site/inspection.json` - New, matches MD.07
- ✅ `schemas/mine-site/status-history.json` - New, matches MD.10
- ✅ `schemas/export-certificate/export-certificate.json` - New, matches MD.03
- ✅ `schemas/chain-of-custody/lot.json` - New, matches MD.12
- ✅ `schemas/chain-of-custody/tag.json` - New, matches MD.11
- ✅ `schemas/chain-of-custody/tax.json` - New, matches MD.13

### Files Needing Update
- ⏳ `api/openapi.yaml` - Needs complete rewrite
- ⏳ `json-ld/context.jsonld` - Needs update for new entities
- ⏳ `graphql/schema.graphql` - Needs update for new entities
- ⏳ `examples/json/*.json` - Need new examples
- ⏳ `README.md` - Needs update
- ⏳ `docs/*.md` - Need updates

## Implementation Notes

1. **Data Exchange Focus**: The standard remains focused on data exchange, not database schema
2. **Extension Support**: Countries can extend the model with additional fields
3. **Validation Rules**: Some fields are conditionally required based on CoC stage
4. **Recursive Structures**: Lot entity supports recursive input_lot references

## Next Steps

1. Update OpenAPI specification
2. Update JSON-LD context
3. Update GraphQL schema
4. Create new examples
5. Update documentation

## References

- Semantic Model: `DOCUMENTATION.txt`
- ICGLR RCM Manual
- ISO 3166-1, ISO 3166-2 standards
- UN/ECE Recommendation N°. 20 (Units of Measure)
- ISO 15000-5:2014, Annex B (Primitive Types)


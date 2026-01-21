# ICGLR JSON Schemas

This directory contains JSON Schema definitions for the ICGLR Mining Sector Data Sharing Protocol Standards, aligned with the semantic model defined in `DOCUMENTATION.txt`.

## Structure

### Core Definitions
- **`core/common.json`** - Shared definitions used across all schemas:
  - ICGLR Member State codes
  - Address (MD.05)
  - Business Entity (MD.04)
  - Geolocalization (MD.06)
  - Contact Details (MD.09)
  - Code Lists (MDC.01 - MDC.06)
  - Identifier formats
  - ICGLR ID format validation

### Primary Entities

#### Mine Site (MD.01)
- **`mine-site/mine-site.json`** - Primary entity for mine site data
- **`mine-site/license.json`** - MD.02 License entity
- **`mine-site/mine-site-location.json`** - MD.08 Mine Site Location
- **`mine-site/inspection.json`** - MD.07 Inspection entity
- **`mine-site/status-history.json`** - MD.10 Status History

#### Export Certificate (MD.03)
- **`export-certificate/export-certificate.json`** - ICGLR Export Certificate entity

#### Chain of Custody (MD.12)
- **`chain-of-custody/lot.json`** - MD.12 Lot entity (Chain of Custody)
- **`chain-of-custody/tag.json`** - MD.11 Tag entity
- **`chain-of-custody/tax.json`** - MD.13 Tax entity

## Semantic Model Alignment

All schemas are aligned with the ICGLR Data Sharing Protocol Standards semantic model:

- **MD.01** - Mine Site
- **MD.02** - License
- **MD.03** - Export Certificate
- **MD.04** - Business Entity (in `core/common.json`)
- **MD.05** - Address (in `core/common.json`)
- **MD.06** - Geolocalization (in `core/common.json`)
- **MD.07** - Inspection
- **MD.08** - Mine Site Location
- **MD.09** - Contact Details (in `core/common.json`)
- **MD.10** - Status History
- **MD.11** - Tag
- **MD.12** - Lot
- **MD.13** - Tax

## Code Lists (MDC.01 - MDC.06)

Defined in `core/common.json`:
- **MDC.01** - Certification Status (0=Blue, 1=Green, 2=Yellow, 3=Red)
- **MDC.02** - Mining Activity Status (0=Abandoned, 1=Active, 2=Non-active)
- **MDC.03** - Mineral (HS Codes and IMA Codes)
- **MDC.04** - License Type
- **MDC.05** - CoC Roles (1-8)
- **MDC.06** - Originating Operations (1-8)

## Key Features

### Naming Convention
- All technical field names use **camelCase**
- Examples: `icglrId`, `certificationStatus`, `mineSiteLocation`

### Identifier Formats
- **Mine Site ID**: `CC-[Lat]-[Long]-NNNNN` (e.g., `RW-1.9641+30.0619-00001`)
- **Country Codes**: ISO 3166-1 alpha-2
- **Subnational Divisions**: ISO 3166-2 format

### Status Codes
- All status values use **integer codes** for language independence
- Certification Status: 0, 1, 2, 3
- Activity Status: 0, 1, 2
- CoC Roles: 1-8
- Originating Operations: 1-8

### Mineral Codes
- Support for HS Codes (Harmonized System)
- Support for IMA Codes (International Mineralogical Association)
- Designated minerals: IMA1960-A (Gold), IMA1960-001 (Cassiterite), IMA2000-014 (Wolframite), IMA1979-A (Coltan)

## Usage

### Validation
```bash
# Validate data against schema
node conformance/validators/schema-validator.js mine-site your-data.json
```

### Database Schema Generation
```bash
# Generate SQLite schema from JSON schemas
cd api-server
npm run generate:db
```

### API Generation
The OpenAPI specification in `api/openapi.yaml` references these schemas for request/response validation.

## Schema References

Schemas use `$ref` to reference shared definitions:

```json
{
  "icglrId": {
    "$ref": "../core/common.json#/definitions/MineSiteIdFormat"
  },
  "certificationStatus": {
    "$ref": "../core/common.json#/definitions/CertificationStatus"
  }
}
```

## Notes

- This standard is designed for **data exchange**, not as a relational database schema
- Countries can extend schemas with additional fields while maintaining compatibility
- All schemas follow JSON Schema Draft 7 specification
- Schemas are validated against the semantic model in `DOCUMENTATION.txt`


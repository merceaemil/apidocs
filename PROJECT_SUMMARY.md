# ICGLR Mining Sector Data Sharing Protocol - Project Summary

## Overview

This project implements the technical model for the ICGLR Mining Sector Data Sharing Protocol Standards, enabling interoperability of reporting between ICGLR member states in the mining sector.

**Status**: All components have been updated to align with the semantic model defined in `DOCUMENTATION.txt`.

## Semantic Model

The implementation is based on the ICGLR Data Sharing Protocol Standards semantic model, which defines:

### Primary Entities
- **MD.01 Mine Site**: Core mining site information with ICGLR ID format
- **MD.03 Export Certificate**: ICGLR export certificates
- **MD.12 Lot**: Chain of Custody tracking

### Secondary Entities
- **MD.02 License**: Mining licenses
- **MD.04 Business Entity**: Companies and organizations
- **MD.05 Address**: Address with ISO 3166-2 subdivisions
- **MD.06 Geolocalization**: WGS 84 coordinates
- **MD.07 Inspection**: Mine site inspections
- **MD.08 Mine Site Location**: Location details
- **MD.09 Contact Details**: Contact information
- **MD.10 Status History**: Certification status changes
- **MD.11 Tag**: Lot tags
- **MD.13 Tax**: Tax payment information

### Code Lists (MDC.01 - MDC.06)
- **MDC.01 Certification Status**: 0=Blue, 1=Green, 2=Yellow, 3=Red
- **MDC.02 Mining Activity Status**: 0=Abandoned, 1=Active, 2=Non-active
- **MDC.03 Mineral**: HS Codes and IMA Codes
- **MDC.04 License Type**: claim, exploration_permit, mining_license, etc.
- **MDC.05 CoC Roles**: 1=Miner, 2=Trader, 3=Shipper, etc.
- **MDC.06 Originating Operations**: 1=Production, 2=Purchase, 3=Combination, etc.

## Completed Components

### ✅ 1. JSON Structures

**Location**: `schemas/`

**Schemas Created**:
- **Core** (`schemas/core/common.json`):
  - ICGLR member state codes
  - Address with ISO 3166-2 subdivisions
  - Geolocalization (WGS 84)
  - Business Entity
  - Contact Details
  - Code lists (Certification Status, Activity Status, Mineral, License Type, CoC Roles, Originating Operations)
  - ICGLR ID format validation

- **Mine Sites** (`schemas/mine-site/`):
  - `mine-site.json` - MD.01 Mine Site (primary entity)
  - `license.json` - MD.02 License
  - `mine-site-location.json` - MD.08 Mine Site Location
  - `inspection.json` - MD.07 Inspection
  - `status-history.json` - MD.10 Status History

- **Export Certificates** (`schemas/export-certificate/`):
  - `export-certificate.json` - MD.03 Export Certificate (primary entity)

- **Chain of Custody** (`schemas/chain-of-custody/`):
  - `lot.json` - MD.12 Lot (primary entity)
  - `tag.json` - MD.11 Tag
  - `tax.json` - MD.13 Tax

**Features**:
- Full JSON Schema validation
- Required/optional field definitions
- Enum constraints
- Format validation (dates, emails, coordinates)
- Reusable common definitions
- **snake_case naming convention**
- **ICGLR ID format validation**: `CC-[Lat]-[Long]-NNNNN`
- **Integer status codes** (language-independent)

### ✅ 2. OpenAPI/Swagger API Specification

**Location**: `api/openapi.yaml`

**Endpoints Defined**:
- **Mine Sites (MD.01)**:
  - `GET /mine-sites` - List with filtering
  - `GET /mine-sites/{icglr_id}` - Get by ICGLR ID
  - `POST /mine-sites` - Create
  - `PUT /mine-sites/{icglr_id}` - Update

- **Export Certificates (MD.03)**:
  - `GET /export-certificates` - List with filtering
  - `GET /export-certificates/{identifier}` - Get by identifier (requires issuing_country)
  - `POST /export-certificates` - Create

- **Chain of Custody - Lots (MD.12)**:
  - `GET /lots` - List lots with filtering
  - `GET /lots/{lot_number}` - Get by lot number
  - `POST /lots` - Create lot record

- **GraphQL**:
  - `POST /graphql` - GraphQL query endpoint

- **Health**:
  - `GET /health` - Health check

**Features**:
- Complete OpenAPI 3.0.3 specification
- Request/response schemas with **snake_case naming**
- Authentication/authorization definitions
- Error handling schemas
- Pagination support
- Filtering parameters (status codes, mineral codes)
- Multiple content types (JSON, JSON-LD)
- **ICGLR ID format validation**
- **Integer status code filtering**

### ✅ 3. Git Repository Structure

**Location**: Root directory

**Structure Created**:
- Complete project structure
- README with overview
- Documentation files
- Configuration files (.gitignore, package.json)
- Deployment guide (DEPLOYMENT.md)
- Migration notes (MIGRATION_NOTES.md)
- Changelog (CHANGELOG.md)

**Ready for Deployment**:
- All files organized
- Git ignore configured
- Package.json for dependencies
- Contributing guidelines
- License placeholder

### ✅ 4. API Conformance Rules

**Location**: `conformance/rules.md`

**Conformance Levels Defined**:
- **Level 1**: Basic conformance (REQUIRED)
  - JSON schema validation
  - **ICGLR ID format**: `CC-[Lat]-[Long]-NNNNN`
  - **snake_case naming convention**
  - Geographic data (WGS84, 4 decimals)
  - Date/time formats (ISO 8601)
  - Member state codes (ISO 3166-1 alpha-2)
  - Units of measure (UN/ECE Recommendation N°. 20)
  - **Integer status codes**
  - **Mineral codes** (HS Codes or IMA Codes)

- **Level 2**: API endpoint conformance (REQUIRED)
  - OpenAPI implementation
  - Endpoint requirements (Mine Sites, Export Certificates, Lots)
  - Pagination
  - Filtering (status codes, mineral codes)
  - Error handling

- **Level 3**: JSON-LD support (RECOMMENDED)
  - JSON-LD context
  - Linked data

- **Level 4**: GraphQL support (OPTIONAL)
  - GraphQL endpoint
  - Flexible querying

**Validation Tools**:
- Schema validator (`conformance/validators/schema-validator.js`)
- Test suite structure (`conformance/test-suites/`)

**Features**:
- Comprehensive conformance requirements
- Validation requirements
- Security requirements
- Performance requirements
- Documentation requirements
- Testing and certification process
- **ICGLR ID format validation**
- **snake_case validation**

### ✅ 5. JSON-LD Model

**Location**: `json-ld/`

**Components**:
- **Context** (`json-ld/context.jsonld`):
  - Complete JSON-LD context definition
  - Vocabulary mappings for all entities (MD.01 - MD.13)
  - Integration with Schema.org, Dublin Core, WGS84 Geo
  - All ICGLR-specific terms defined
  - **snake_case field mappings**

- **Vocabulary** (`json-ld/vocab/`):
  - Vocabulary documentation
  - Usage examples
  - Primary and secondary entity definitions

**Features**:
- Semantic web compatibility
- Linked data support
- Vocabulary reuse
- Machine-readable semantics
- **Complete entity coverage** (Mine Site, Export Certificate, Lot, etc.)

### ✅ 6. GraphQL Schema

**Location**: `graphql/schema.graphql`

**Components**:
- Complete GraphQL schema definition
- Query types for all primary entities (Mine Site, Export Certificate, Lot)
- Mutation types for data submission
- Flexible querying mechanism
- Aggregation and analytics queries
- Federation support
- **Chain of Custody support**

**Features**:
- Type-safe queries
- Flexible data extraction
- Support for non-standard APIs
- Pagination support
- Filtering capabilities
- Aggregation queries
- **Status code enums** (CertificationStatus, MiningActivityStatus, CoCRole, OriginatingOperation)

## Additional Components

### Documentation

- **README.md**: Project overview and structure
- **DOCUMENTATION.txt**: Semantic model documentation
- **MIGRATION_NOTES.md**: Migration notes from initial implementation
- **CHANGELOG.md**: Version history
- **docs/architecture.md**: Architecture and design principles
- **docs/implementation-guide.md**: Step-by-step implementation guide
- **DEPLOYMENT.md**: Git deployment instructions
- **CONTRIBUTING.md**: Contribution guidelines

### Examples

- **examples/json/**: JSON data examples
  - `mine-site-example.json` - Complete mine site example
  - `export-certificate-example.json` - Export certificate example
  - `lot-example.json` - Chain of Custody lot example

- **examples/requests/**: API request examples
  - HTTP request examples for all endpoints
  - GraphQL query examples
  - Error handling examples
  - Filtering examples with status codes

### Tools

- **Schema Validator**: JavaScript validator for JSON schemas
- **Validation Documentation**: How to use validators
- **Test Suites**: Comprehensive conformance test cases

## Key Features

### 1. Data Exchange Focus

The standard is explicitly designed for **data exchange**, not as a relational database schema. This allows implementers flexibility in storage while ensuring interoperability.

### 2. Semantic Model Alignment

All components align with the ICGLR Data Sharing Protocol Standards semantic model:
- Primary entities: Mine Site, Export Certificate, Lot
- Secondary entities: License, Business Entity, Address, etc.
- Code lists: MDC.01 - MDC.06
- Naming convention: **snake_case**

### 3. ICGLR ID Format

Standardized mine site identification:
- Format: `CC-[Lat]-[Long]-NNNNN`
- Example: `RW-1.9641+30.0619-00001`
- Country code + coordinates + sequential number
- Validated automatically

### 4. Language-Independent Status Codes

Integer codes for all status values:
- Certification Status: 0 (Blue), 1 (Green), 2 (Yellow), 3 (Red)
- Activity Status: 0 (Abandoned), 1 (Active), 2 (Non-active)
- CoC Roles: 1-8 (Miner, Trader, Shipper, Processor, etc.)
- Originating Operations: 1-8 (Production, Purchase, Combination, etc.)

### 5. Chain of Custody Support

Complete Chain of Custody tracking:
- Lot entity (MD.12) supports all CoC operations
- Recursive input_lot references
- Conditional requirements (mine_site_id and tag for Production)
- Tax payment tracking
- Transformation support (1-to-1, 1-to-n, n-to-1, n-to-n)

### 6. Mineral Code Support

- HS Codes (Harmonized System)
- IMA Codes (International Mineralogical Association)
- Designated minerals (3TG): Gold, Cassiterite, Wolframite, Coltan

### 7. Progressive Enhancement

Four conformance levels allow gradual adoption:
- Start with Level 1 (basic)
- Add Level 2 (API endpoints)
- Optionally add Level 3 (JSON-LD)
- Optionally add Level 4 (GraphQL)

### 8. Multiple Access Patterns

- RESTful APIs (OpenAPI)
- GraphQL for flexible querying
- JSON-LD for semantic web
- Standard JSON for simple integration

### 9. Comprehensive Validation

- JSON Schema validation
- Conformance rules
- Validation tools
- Test suites structure
- ICGLR ID format validation
- Status code validation

### 10. ISO Standards Compliance

- ISO 3166-1 alpha-2 (Country codes)
- ISO 3166-2 (Subnational divisions)
- ISO 8601 (Dates and times)
- ISO 15000-5:2014, Annex B (Primitive types)
- WGS 84 (Geographic coordinates)
- UN/ECE Recommendation N°. 20 (Units of measure)

## File Structure Summary

```
.
├── README.md                          # Main documentation
├── DOCUMENTATION.txt                  # Semantic model documentation
├── MIGRATION_NOTES.md                 # Migration notes
├── CHANGELOG.md                       # Version history
├── LICENSE.md                         # License
├── CONTRIBUTING.md                    # Contribution guide
├── DEPLOYMENT.md                      # Deployment guide
├── PROJECT_SUMMARY.md                 # This file
├── package.json                       # Dependencies
├── .gitignore                         # Git ignore
│
├── schemas/                           # ✅ JSON Schemas
│   ├── core/
│   │   └── common.json               # Common definitions
│   ├── mine-site/                    # MD.01, MD.02, MD.07, MD.08, MD.10
│   │   ├── mine-site.json
│   │   ├── license.json
│   │   ├── mine-site-location.json
│   │   ├── inspection.json
│   │   └── status-history.json
│   ├── export-certificate/           # MD.03
│   │   └── export-certificate.json
│   └── chain-of-custody/             # MD.12, MD.11, MD.13
│       ├── lot.json
│       ├── tag.json
│       └── tax.json
│
├── api/                               # ✅ OpenAPI/Swagger
│   └── openapi.yaml
│
├── json-ld/                           # ✅ JSON-LD Model
│   ├── context.jsonld
│   └── vocab/
│
├── graphql/                           # ✅ GraphQL Schema
│   ├── schema.graphql
│   └── resolvers/
│
├── conformance/                       # ✅ Conformance Rules
│   ├── rules.md
│   ├── validators/
│   └── test-suites/
│
├── examples/                          # Examples
│   ├── json/
│   │   ├── mine-site-example.json
│   │   ├── export-certificate-example.json
│   │   └── lot-example.json
│   └── requests/
│       └── api-request-examples.md
│
└── docs/                              # Documentation
    ├── architecture.md
    └── implementation-guide.md
```

## Next Steps

### For ICGLR

1. **Review**: Review all components
2. **Feedback**: Collect feedback from member states
3. **Refinement**: Make minor adjustments based on feedback
4. **Deployment**: Deploy to ICGLR Git organization
5. **Announcement**: Announce to member states
6. **Certification**: Establish certification process

### For Implementers

1. **Review Standard**: Read `DOCUMENTATION.txt` and all documentation
2. **Choose Approach**: Select implementation pattern (Direct, Adapter, GraphQL Gateway)
3. **Implement**: Follow implementation guide
4. **Validate**: Use validation tools
5. **Test**: Run conformance tests
6. **Certify**: Get conformance certification

## Compliance Checklist

- [x] JSON structures defined (aligned with semantic model)
- [x] OpenAPI/Swagger specification complete
- [x] Git repository structure ready
- [x] Conformance rules defined
- [x] JSON-LD model created
- [x] GraphQL schema defined
- [x] Examples provided
- [x] Documentation complete
- [x] Validation tools included
- [x] Deployment guide provided
- [x] **snake_case naming convention implemented**
- [x] **ICGLR ID format defined and validated**
- [x] **Integer status codes implemented**
- [x] **Chain of Custody support complete**
- [x] **Mineral code support (HS/IMA)**
- [x] **All semantic model entities implemented**

## Version

**Version**: 1.0.0  
**Status**: Ready for Review  
**Date**: 2024  
**Based on**: ICGLR Data Sharing Protocol Standards semantic model (DOCUMENTATION.txt)

## Contact

For questions or feedback, contact the ICGLR Secretariat.

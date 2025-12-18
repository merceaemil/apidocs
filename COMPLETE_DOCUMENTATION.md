# ICGLR Mining Sector Data Sharing Protocol - Complete Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [For Non-Technical Readers](#for-non-technical-readers)
3. [Technical Documentation](#technical-documentation)
   - [Project Overview](#project-overview)
   - [Architecture](#architecture)
   - [Getting Started](#getting-started)
   - [API Reference](#api-reference)
   - [Implementation Guide](#implementation-guide)
   - [Conformance Rules](#conformance-rules)
   - [Development Guide](#development-guide)

---

## Introduction

The **ICGLR Mining Sector Data Sharing Protocol Standards** is a comprehensive technical framework designed to enable seamless data exchange and interoperability between ICGLR (International Conference on the Great Lakes Region) member states in the mining sector. This standard addresses the critical need for standardized reporting, tracking, and verification of mining operations across borders.

### What is ICGLR?

The International Conference on the Great Lakes Region (ICGLR) is an intergovernmental organization of countries in the African Great Lakes region. Member states include Angola, Burundi, Central African Republic, Democratic Republic of Congo, Republic of Congo, Kenya, Rwanda, Republic of South Sudan, Sudan, Tanzania, Uganda, and Zambia.

**ICGLR** (English) / **CIRGL** (French: Conférence Internationale sur la Région des Grands Lacs) is composed of 12 Member States working together to promote peace, security, stability, and development in the Great Lakes region.

### Key Terms and Acronyms

- **RCM** (Regional Certification Mechanism) / **MRC** (Mécanisme régional de certification): A system designed to combat the trade of conflict minerals in the Great Lakes Region. It ensures that minerals such as tin, tantalum, tungsten, and gold (3TG) are sourced responsibly and do not contribute to financing armed groups or human rights abuses.

- **RDBMF** (Regional Database of Mineral Flows) / **BDRFM** (Base de données régionale des minerais): A digital platform designed to track and monitor the trade of minerals within the Great Lakes Region. It is a key component of the RCM and supports transparency in the mineral supply chain.

- **NMD** (National Minerals Database) / **BDNM** (Base de données nationale sur les minéraux): The technical data storage facility and application used to manage mining data at country level, implemented by each ICGLR member state.

- **CoC** (Chain of Custody) / **CdP** (Chaîne de possession): A process that tracks the movement of minerals through their collection, safeguarding, and analysis lifecycle.

- **API** (Application Programming Interface): A connection between computers or computer programs that offers a service to other pieces of software.

### Development History

The standard was developed in two phases through extensive collaboration with ICGLR member states:

**Phase 1: October 2024 - March 2025**
- Initial development focusing on a subset of data entities: Mine Site, Inspection, License, and Export Certificate
- Presented, discussed, and validated by the ICGLR Technical Working Group in Lusaka, 18-20 March 2025

**Phase 2: October 2025 - December 2025**
- Extended coverage to all data entities referenced in the RCM manual
- Complete Chain of Custody (CoC) implementation

The development process included:
- Analysis of existing ICGLR documentation (RCM Manual, Appendices, Data Transfer Procedures)
- Direct engagement with ICGLR member states through surveys and interviews
- Technical Working Group meetings and feedback integration
- Review of national mining cadasters and data structures

### Purpose of This Standard

The mining sector in the Great Lakes region faces challenges related to:
- **Transparency**: Ensuring accurate reporting of mining activities
- **Traceability**: Tracking minerals from mine to export
- **Compliance**: Meeting international standards for conflict-free minerals
- **Interoperability**: Enabling different countries' systems to communicate

**The Problem**: Currently, there is no standardization in place related to mining data models used at the country level, between countries, or between countries and ICGLR. Manual data input and Excel imports are inefficient and unsustainable. The Regional Minerals Database cannot effectively collect information due to lack of uniform digitalization and data standardization.

**The Solution**: This standard provides a common "language" that all ICGLR member states can use to share mining data, ensuring that information from one country can be understood and processed by systems in another country. It enables:
- Automated data exchange between member states and ICGLR
- Interoperability between systems at the national level
- Standardized data storage for consistency, audit, and control

### Key Benefits

- **Standardized Data Format**: All countries use the same data structure
- **Automated Validation**: Built-in checks ensure data quality
- **Chain of Custody Tracking**: Complete traceability of minerals
- **API-Based Exchange**: Modern, programmatic data sharing
- **Flexible Implementation**: Countries can adapt existing systems
- **Language-Independent**: Uses integer codes instead of text for status values
- **Semantic Interoperability**: Based on ontological approach, independent of technical implementation

---

## For Non-Technical Readers

### What Does This Project Do?

Imagine you're trying to send a letter to someone in another country. You need to:
1. Write it in a language they understand
2. Use the correct address format
3. Include all necessary information
4. Follow postal regulations

Similarly, when countries need to share information about mining operations, they need a common format. This project provides that format.

### The Problem It Solves

**Before this standard:**
- Country A tracks mine sites using one format
- Country B uses a completely different format
- When they try to share data, it's like speaking different languages
- Information gets lost or misunderstood
- Manual translation is required, which is slow and error-prone

**With this standard:**
- All countries use the same format
- Data can be automatically shared and understood
- Systems can "talk" to each other directly
- Information is consistent and reliable

### Real-World Example

Let's say Rwanda wants to verify that a shipment of minerals from the Democratic Republic of Congo (DRC) is legitimate:

1. **Mine Site Registration**: DRC registers a mine site with a unique ID (like `CD-4.0511+21.7587-00001`)
2. **Production Tracking**: When minerals are extracted, a "lot" is created with all details
3. **Chain of Custody**: As minerals move from mine → trader → processor → exporter, each step is recorded
4. **Export Certificate**: When exported, an ICGLR certificate is issued
5. **Verification**: Rwanda can query the system to verify the certificate and trace back to the original mine

All of this happens automatically through standardized APIs, ensuring transparency and preventing fraud.

### Key Concepts Explained Simply

#### 1. Mine Site
A physical location where mining occurs. Each site gets a unique ID that includes:
- Country code (e.g., RW for Rwanda)
- GPS coordinates (latitude and longitude)
- A sequential number

Example: `RW-1.9641+30.0619-00001` means:
- Country: Rwanda (RW)
- Location: Latitude 1.9641, Longitude 30.0619
- Site number: 00001

#### 2. Export Certificate
A digital certificate that proves minerals were legally extracted and exported. It includes:
- Who exported it
- Who imported it
- What minerals
- Where they came from
- Verification details

#### 3. Chain of Custody (Lot)
A record that tracks minerals as they move through the supply chain:
- Production at the mine
- Purchase by traders
- Processing
- Transportation
- Export

Each step creates a "lot" record, like a receipt that follows the minerals.

#### 4. Status Codes
Instead of using words (which vary by language), the system uses numbers:
- **Certification Status**: 0=Blue, 1=Green, 2=Yellow, 3=Red
- **Activity Status**: 0=Abandoned, 1=Active, 2=Non-active

This ensures everyone understands the same thing, regardless of language.

### How It Works (Simple Version)

1. **Country A** has a mining database system
2. **Country B** has a different mining database system
3. Both systems implement this standard
4. When Country A needs to verify something from Country B:
   - Country A's system sends a request (like asking a question)
   - Country B's system responds with data in the standard format
   - Country A's system automatically understands and processes it

### What This Means for Governments

- **Better Oversight**: Can track minerals across borders
- **Faster Verification**: Automated checks instead of manual review
- **Reduced Fraud**: Standardized tracking makes fraud harder
- **Compliance**: Easier to meet international requirements
- **Transparency**: Citizens can see verified mining data

### What This Means for Mining Companies

- **Simplified Reporting**: One format for all ICGLR countries
- **Faster Processing**: Automated systems process data quickly
- **Market Access**: Easier to export to ICGLR member states
- **Compliance**: Built-in validation ensures compliance

### What This Means for Citizens

- **Transparency**: Can verify mining operations are legitimate
- **Accountability**: Clear tracking of mineral flows
- **Trust**: Standardized system builds confidence
- **Development**: Better data supports better policies

---

## Technical Documentation

### Project Overview

This repository contains the complete technical implementation model for the ICGLR Mining Sector Data Sharing Protocol Standards. It includes:

- **JSON Schemas**: Data structure definitions
- **OpenAPI Specification**: API endpoint definitions
- **Reference Implementation**: Working API server
- **Validation Tools**: Conformance checking
- **Documentation**: Complete guides and examples

### Repository Structure

```
.
├── README.md                          # Project overview
├── COMPLETE_DOCUMENTATION.md          # This file
├── DOCUMENTATION.txt                  # Semantic model documentation
├── PROJECT_SUMMARY.md                 # Project status summary
├── MIGRATION_NOTES.md                 # Migration notes
├── CHANGELOG.md                       # Version history
│
├── schemas/                           # JSON Schema definitions
│   ├── core/
│   │   └── common.json               # Shared definitions
│   ├── mine-site/                    # Mine site entities
│   │   ├── mine-site.json            # MD.01 Mine Site
│   │   ├── license.json              # MD.02 License
│   │   ├── mine-site-location.json   # MD.08 Location
│   │   ├── inspection.json           # MD.07 Inspection
│   │   └── status-history.json       # MD.10 Status History
│   ├── export-certificate/           # Export certificate
│   │   └── export-certificate.json   # MD.03 Export Certificate
│   └── chain-of-custody/             # Chain of Custody
│       ├── lot.json                  # MD.12 Lot
│       ├── tag.json                  # MD.11 Tag
│       └── tax.json                  # MD.13 Tax
│
├── api/                               # API specifications
│   └── openapi.yaml                  # OpenAPI 3.0.3 specification
│
├── api-server/                        # Reference implementation
│   ├── src/                          # Generated server code
│   │   ├── server.js                 # Main server file
│   │   ├── routes/                   # API route handlers
│   │   ├── services/                 # Business logic
│   │   ├── middleware/               # Validation & error handling
│   │   └── database/                 # Database connection
│   ├── scripts/                      # Generation scripts
│   │   ├── generate-api.js           # Generate API from OpenAPI
│   │   ├── generate-db-schema.js     # Generate DB from schemas
│   │   └── seed.js                   # Seed database
│   ├── data/                         # SQLite database
│   └── package.json                  # Dependencies
│
├── json-ld/                           # JSON-LD semantic web
│   ├── context.jsonld               # JSON-LD context
│   └── vocab/                        # Vocabulary definitions
│
├── graphql/                           # GraphQL schema
│   ├── schema.graphql                # GraphQL schema definition
│   └── resolvers/                    # Resolver examples
│
├── conformance/                       # Conformance rules
│   ├── rules.md                      # Conformance requirements
│   ├── validators/                   # Validation tools
│   │   └── schema-validator.js       # Schema validator
│   └── test-suites/                  # Test cases
│
├── examples/                          # Example data
│   ├── json/                         # JSON examples
│   │   ├── mine-site-example.json
│   │   ├── export-certificate-example.json
│   │   └── lot-example.json
│   └── requests/                     # API request examples
│       └── api-request-examples.md
│
└── docs/                              # Additional documentation
    ├── architecture.md               # Architecture overview
    └── implementation-guide.md        # Implementation guide
```

### Semantic Model

The implementation is based on the ICGLR Data Sharing Protocol Standards semantic model, developed following ISO and CEN (European Committee for Standardization) best practices. The model follows an **ontological approach**, describing entities and their attributes, and the relationships between them.

#### Entity Structure

The model distinguishes between:

**Primary Entities** (not included in other entities):
- **MD.01 Mine Site**: Core mining site information
- **MD.03 Export Certificate**: ICGLR export certificates  
- **MD.12 Lot**: Chain of Custody tracking

**Secondary Entities** (referenced by primary entities):
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

Secondary entities can be nested. For example:
- Mine Site HAS Mine Site Location
- Mine Site Location HAS Geolocalization AND HAS Address

**Key Principles:**
- Each entity includes attributes and can reference other entities
- Each attribute has a Data Type from ISO 15000-5:2014, Annex B Primitive Types
- Each attribute has Cardinality, Name (Business Term), Description, and Semantic Data Type
- The model is technology-independent and can be represented in JSON, XML, JSON-LD, or SQL

**Naming Convention:**
- **Business Terms**: Human-readable terms that describe concepts (e.g., "ICGLR Identification number")
- **Technical Terms**: Transcriptions of business terms in `snake_case` (e.g., `icglr_id`)
- The standard uses `snake_case` as it is the most human-readable and aligns with other standardization initiatives

**Cardinality Notation:**
- `1..1` - Required, only once (at least one, at most one)
- `0..1` - Optional, only once (at most one, or none)
- `0..n` - Any number of occurrences, or none
- `1..n` - Any number of occurrences, at least one
- `1..X` - At most X specific number, at least one

**Primitive Data Types:**
- **Date**: Calendar day in ISO 8601 format (YYYY-MM-DD)
- **Decimal**: Subset of real numbers represented by decimal numerals
- **String**: Finite sequence of characters
- **Identifier**: Finite sequence of characters adhering to a format rule (subtype of String)

The semantic model defines:

#### Primary Entities

- **MD.01 Mine Site**: Core mining site information with ICGLR ID format
- **MD.03 Export Certificate**: ICGLR export certificates
- **MD.12 Lot**: Chain of Custody tracking

#### Secondary Entities

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

#### Code Lists (MDC.01 - MDC.06)

**MDC.01 Certification Status** (Integer codes for language independence):
- `0` = Blue (Uninspected or Out of RCM scope)
- `1` = Green (Certified)
- `2` = Yellow (Yellow-Flagged)
- `3` = Red (Un-Certified)

*Note: A site has blue status either because it is not yet inspected or because the validity (green status) has expired after one year and the Government has not yet inspected the mine site. However, the blue status can be valid for 3 years, otherwise the mine site turns red.*

**MDC.02 Mining Activity Status** (Integer codes):
- `0` = Abandoned
- `1` = Active
- `2` = Non-active

**MDC.03 Mineral** (HS Codes and IMA Codes):
- **Gold**: HS Code `7108.12.00` / IMA Code `IMA1960-A`
- **Cassiterite**: HS Code `2609.00.00` / IMA Code `IMA1960-001`
- **Wolframite**: HS Code `2611.00.00` / IMA Code `IMA2000-014`
- **Coltan** (Columbite-Tantalite): HS Code `2615.90.00` / IMA Code `IMA1979-A`

*Note: HS Codes (Harmonized System) are used as the general standard for data exchange. The list should be extended with codes relevant for each country's context.*

**MDC.04 License Type** (String values):
- `claim` - Claim
- `exploration_permit` - Exploration permit
- `mining_license` - Mining license
- `artisanal_permit` - Artisanal permit
- `unlicensed` - Unlicensed
- `other` - Other

**MDC.05 CoC Roles** (Integer codes):
- `1` = Miner
- `2` = Trader (in-country)
- `3` = Shipper
- `4` = Processor
- `5` = Warehouse
- `6` = Importer
- `7` = Exporter
- `8` = Government

**MDC.06 Originating Operations** (Integer codes, can be combined):
- `1` = Production
- `2` = Purchase
- `3` = Combination
- `4` = Processing
- `5` = Transportation
- `6` = Storage/Warehousing
- `7` = Import
- `8` = Export

*Note: Originating operations can be combined. For example, a lot can have operations 2, 3, 4 (Purchase, Combination, Processing) as its origin.*

### Detailed Entity Descriptions

#### MD.01 Mine Site

The Mine Site is a primary entity representing a physical location where mining occurs. Key attributes include:

- **icglr_id** (Business Term: ICGLR Identification number): Unique identifier in format `CC-[Lat]-[Long]-NNNNN`
- **address_country** (Business Term: Country): ISO 3166-1 alpha-2 country code
- **national_id** (Business Term: National Identification Number): Unique identifier at country level
- **certification_status**: Current certification status (0=Blue, 1=Green, 2=Yellow, 3=Red)
- **activity_status**: Mining activity status (0=Abandoned, 1=Active, 2=Non-active)
- **mine_site_location**: Geographic location (references MD.08)
- **mineral**: Array of minerals produced (1..n, using IMA codes)
- **license**: Array of licenses (1..n, references MD.02)
- **owner**: Business entity that owns the mine (references MD.04)
- **operator**: Array of operators if different from owner (0..n, references MD.04)
- **inspection**: Array of inspections (0..n, references MD.07)
- **status_history**: Array of status changes (0..n, references MD.10)

**Certification Status Notes:**
- Blue status (0) can be valid for 3 years, otherwise the mine site turns red
- A site has blue status either because it is not yet inspected or because green status validity has expired after one year

#### MD.03 Export Certificate

The Export Certificate represents an ICGLR Regional Certificate issued for mineral exports. Key attributes include:

- **issuing_country**: ISO 3166-1 alpha-2 country code
- **identifier**: Unique serial number (unique in the country)
- **exporter**: Business entity (references MD.04)
- **importer**: Business entity (references MD.04)
- **lot_number**: Exporter's unique lot number
- **designated_mineral_description**: Textual description
- **type_of_ore**: Mineral code (references MDC.03)
- **lot_weight**: Numeric value (Decimal)
- **lot_weight_uom**: Unit of measure (UN/ECE Recommendation N°. 20)
- **lot_grade**: Grade expression (varies by mineral)
- **mineral_origin**: Country codes separated by space (e.g., "CD BI RW")
- **customs_value**: Declared value in USD (String with currency code or Decimal)
- **date_of_shipment**: Planned shipment date
- **shipment_route**: ISO 3166 codes separated by comma (optional)
- **transport_company**: Transport company name (optional)
- **member_state_issuing_authority**: Issuing authority name
- **name_of_verifier**: Verifier's name
- **position_of_verifier**: Verifier's position
- **id_of_verifier**: Verifier's ID (optional)
- **date_of_verification**: Verification date
- **name_of_validator**: Validator's name
- **date_of_issuance**: Certificate countersign date
- **date_of_expiration**: Expiration date (no more than 90 days from issuance)
- **certificate_file**: Certificate as file

**Important Notes:**
- The certificate should allow regeneration in any language (RCM requires English and French)
- Mineral origin uses space-separated country codes, not the word "mixed"
- Date of expiration is stored directly (not computed from validity period) to avoid ambiguity

#### MD.12 Lot (Chain of Custody)

The Lot entity is central to Chain of Custody tracking. It represents a holder of a quantity of minerals that are mined, intended for transport, processing, or sale.

**Key Attributes:**
- **lot_number**: Lot number given by CoC actor (Identifier)
- **timestamp**: Date+time when registration was created (automatically generated)
- **creator**: Business entity that created the lot (current custodian, references MD.04)
- **mineral**: Contained mineral identifier (references MDC.03)
- **concentration**: Approximate concentration percentage (Decimal)
- **mass**: Lot weight (Decimal)
- **package_type**: Type of packaging (optional, String)
- **unit_of_measurement**: Unit of measure (UN/ECE Recommendation N°. 20)
- **mine_site_id**: Mine site identifier (REQUIRED when originating_operation includes Production, references MD.01)
- **creator_role**: Array of CoC roles (1..n, references MDC.05)
- **recipient**: Lot recipient business entity (optional, references MD.04)
- **originating_operation**: Array of operations (1..n, references MDC.06)
- **input_lot**: Array of lots that form this lot (0..n, recursive reference to MD.12)
- **tag**: Associated tag (REQUIRED when originating_operation includes Production, references MD.11)
- **tax_paid**: Array of taxes paid (0..n, references MD.13)
- **date_sealed**: Date when lot is sealed
- **date_shipped**: Date when lot is shipped
- **purchase_number**: Purchase order number (optional, for purchases)
- **purchase_date**: Purchase date (optional)
- **responsible_staff**: Name of responsible staff (optional, String)
- **date_in**: Date received by processor (optional)
- **transportation_method**: Transportation method (optional)
- **transportation_route**: Transportation route (optional)
- **transport_company**: Transport company (optional)
- **export_certificate_id**: ICGLR Certificate number if for export (optional, references MD.03)

**Key Rules:**
1. Time of registration is automatically generated by the software system
2. Information from previous CoC stages should be retained in the Lot record
3. A Lot registered at Production might not have "recipient" and "date_shipped" initially, but must include them when referenced by another Lot
4. If originating_operation includes Production (1), then `mine_site_id` and `tag` are REQUIRED

**Lot Transformations:**
The model supports all types of lot-to-lot transformations:
- 1-to-1: Single lot becomes single lot
- 1-to-n: Single lot splits into multiple lots
- n-to-1: Multiple lots combine into single lot
- n-to-n: Multiple lots transform into multiple lots

#### MD.04 Business Entity

Represents companies and organizations involved in mining operations. Attributes include:

- **identifier**: Unique identification number
- **name**: Legal name as officially registered
- **legal_address**: Legal address (references MD.05 Address)
- **physical_address**: Physical address (references MD.05 Address)
- **tin**: Tax ID Number in country of registration
- **rdb_number**: Business registration number
- **rca_number**: Other identifying information
- **contact_details**: Contact details (references MD.09 Contact Details)

#### MD.05 Address

Address information using ISO standards:

- **country**: ISO 3166-1 alpha-2 country code (required)
- **subnational_division_l1**: ISO 3166-2 code (e.g., "RW-02", required)
- **subnational_division_l1_text**: Textual name (optional)
- **subnational_division_l2**: Level 2 subdivision (optional)
- **subnational_division_l3**: Level 3 subdivision (optional)
- **subnational_division_l4**: Level 4 subdivision (optional)
- **address_locality**: Locality as designated in UPU S42, ISO 19160-1 (required)

#### MD.06 Geolocalization

Geographic coordinates:

- **latitude**: Latitude in WGS 84 format, decimal degrees with 4 decimals (-90 to 90)
- **longitude**: Longitude in WGS 84 format, decimal degrees with 4 decimals (-180 to 180)

#### MD.07 Inspection

Mine site inspection records:

- **inspection_id**: Generated identifier (e.g., "PS-2025-12-02-16-03" for inspector initials and timestamp)
- **inspection_date**: Date of inspection
- **inspection_responsible**: Agency and person responsible
- **inspection_findings**: Findings (Certified, un-Certified, or Yellow Flagged)
- **inspection_report**: Full inspection report (File)
- **inspection_purpose**: Short text
- **inspection_results**: Long text
- **inspector_name**: Full name
- **inspector_position**: Title or position
- **government_agency**: Government agency (short text)
- **government_id**: Government identification number (optional)

#### MD.11 Tag

Tag attached to a Lot:

- **identifier**: Unique ID (can be QR code, barcode, numeric)
- **issuer**: Organization that issued the tag (references MD.04)
- **issue_date**: Date when tag was created
- **issue_time**: Time when tag was created (format: HH:mm:ss)

#### MD.13 Tax

Tax payment information:

- **tax_type**: Textual description of tax type
- **tax_amount**: Value of paid tax (Decimal)
- **currency**: Currency code (ISO 4217, 3 letters)

### Architecture

#### Design Principles

1. **Data Exchange Focus**: The standard is designed for data exchange, not as a relational database schema
2. **Semantic Interoperability**: JSON-LD provides semantic meaning for linked data
3. **Technical Flexibility**: Multiple access patterns (REST, GraphQL, JSON-LD)
4. **Progressive Enhancement**: Four conformance levels allow gradual adoption

#### Architecture Layers

1. **Semantic Layer**: JSON-LD context and vocabulary definitions
2. **Schema Layer**: JSON schemas for validation
3. **API Layer**: OpenAPI specification and GraphQL schema
4. **Conformance Layer**: Rules, validators, and test suites

#### Data Flow

```
[System A] --[JSON/JSON-LD]--> [ICGLR API] --[JSON/JSON-LD]--> [System B]
                |                                        |
                +--[Validation]--+                       |
                            [Schema Validator]           |
                                                         |
[System C] --[GraphQL]---------> [ICGLR API] <----------+
```

### Getting Started

#### Prerequisites

- Node.js 18+ installed
- npm installed
- Git (for cloning repository)

#### Quick Start (5 minutes)

```bash
# 1. Navigate to api-server directory
cd api-server

# 2. Install dependencies
npm install

# 3. Generate database schema from JSON schemas
npm run db:generate

# 4. Generate API server from OpenAPI specification
npm run api:generate

# 5. (Optional) Seed with example data
npm run db:seed

# 6. Start the server
npm start
```

#### Access Points

Once the server is running:

- **API Base URL**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/openapi.json`
- **OpenAPI YAML**: `http://localhost:3000/openapi.yaml`
- **Health Check**: `http://localhost:3000/health`

#### Test the API

```bash
# List mine sites
curl http://localhost:3000/mine-sites

# Get specific mine site
curl http://localhost:3000/mine-sites/RW-1.9641+30.0619-00001

# Create mine site (from example)
curl -X POST http://localhost:3000/mine-sites \
  -H "Content-Type: application/json" \
  -d @../examples/json/mine-site-example.json
```

### API Reference

#### Base URL

- Production: `https://api.icglr.org/v1`
- Staging: `https://api-staging.icglr.org/v1`
- Local: `http://localhost:3000`

#### Authentication

The API supports two authentication methods:

1. **Bearer Token (JWT)**
   ```http
   Authorization: Bearer <token>
   ```

2. **API Key**
   ```http
   X-API-Key: <api-key>
   ```

#### Mine Sites Endpoints (MD.01)

##### List Mine Sites

```http
GET /mine-sites
```

**Query Parameters:**
- `address_country` (string): Filter by ICGLR member state code
- `certification_status` (integer): Filter by certification status (0-3)
- `activity_status` (integer): Filter by activity status (0-2)
- `mineral` (string): Filter by mineral code
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "icglr_id": "RW-1.9641+30.0619-00001",
      "address_country": "RW",
      "national_id": "MINE-001",
      "certification_status": 1,
      "activity_status": 1,
      "mine_site_location": { ... },
      "mineral": ["IMA1960-001"],
      "license": [ ... ],
      "owner": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

##### Get Mine Site by ID

```http
GET /mine-sites/{icglr_id}
```

**Path Parameters:**
- `icglr_id` (string): ICGLR mine site ID (format: `CC-[Lat]-[Long]-NNNNN`)

**Response:**
```json
{
  "icglr_id": "RW-1.9641+30.0619-00001",
  "address_country": "RW",
  "national_id": "MINE-001",
  "certification_status": 1,
  "activity_status": 1,
  "mine_site_location": { ... },
  "mineral": ["IMA1960-001"],
  "license": [ ... ],
  "owner": { ... },
  "operator": [ ... ],
  "inspection": [ ... ],
  "status_history": [ ... ]
}
```

##### Create Mine Site

```http
POST /mine-sites
Content-Type: application/json
```

**Request Body:**
```json
{
  "icglr_id": "RW-1.9641+30.0619-00001",
  "address_country": "RW",
  "national_id": "MINE-001",
  "certification_status": 1,
  "activity_status": 1,
  "mine_site_location": {
    "geolocalization": {
      "latitude": -1.9641,
      "longitude": 30.0619
    },
    "national_cadaster_localization": "CAD-12345",
    "local_geographic_designation": {
      "country": "RW",
      "subnational_division_l1": "RW-02",
      "address_locality": "Muhanga"
    }
  },
  "mineral": ["IMA1960-001"],
  "license": [ ... ],
  "owner": { ... }
}
```

**Response:** `201 Created` with the created mine site

##### Update Mine Site

```http
PUT /mine-sites/{icglr_id}
Content-Type: application/json
```

**Request Body:** Same as create, with updated values

**Response:** `200 OK` with the updated mine site

#### Export Certificates Endpoints (MD.03)

##### List Export Certificates

```http
GET /export-certificates
```

**Query Parameters:**
- `issuing_country` (string): Filter by issuing country
- `identifier` (string): Filter by certificate serial number
- `lot_number` (string): Filter by lot number
- `type_of_ore` (string): Filter by mineral code
- `date_of_issuance_from` (date): Filter from date
- `date_of_issuance_to` (date): Filter to date
- `page` (integer): Page number
- `limit` (integer): Results per page

##### Get Export Certificate

```http
GET /export-certificates/{identifier}?issuing_country={country}
```

**Path Parameters:**
- `identifier` (string): Certificate serial number

**Query Parameters:**
- `issuing_country` (string, required): Issuing country code

##### Create Export Certificate

```http
POST /export-certificates
Content-Type: application/json
```

#### Chain of Custody - Lots Endpoints (MD.12)

##### List Lots

```http
GET /lots
```

**Query Parameters:**
- `mine_site_id` (string): Filter by mine site ICGLR ID
- `mineral` (string): Filter by mineral code
- `creator_role` (integer): Filter by CoC role code (1-8)
- `originating_operation` (integer): Filter by operation code (1-8)
- `lot_number` (string): Filter by lot number
- `timestamp_from` (date-time): Filter from timestamp
- `timestamp_to` (date-time): Filter to timestamp
- `page` (integer): Page number
- `limit` (integer): Results per page

##### Get Lot

```http
GET /lots/{lot_number}
```

##### Create Lot

```http
POST /lots
Content-Type: application/json
```

#### Error Responses

All endpoints return standardized error responses:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "field_name",
    "reason": "Validation error details"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400): Request validation failed
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `INTERNAL_ERROR` (500): Internal server error

### Implementation Guide

#### Step 1: Review the Standard

1. Read `README.md` for overview
2. Review `conformance/rules.md` for requirements
3. Examine `schemas/` for data structures
4. Check `api/openapi.yaml` for API specification

#### Step 2: Choose Implementation Approach

**Option A: Direct Implementation**
- Implement OpenAPI spec directly
- Best for new systems
- Full control over implementation

**Option B: Adapter Pattern**
- Build adapter layer over existing system
- Best for legacy systems
- Minimal changes to existing code

**Option C: GraphQL Gateway**
- Use GraphQL to federate multiple sources
- Best for multiple data sources
- Flexible querying

#### Step 3: Data Model Mapping

Map your internal data model to ICGLR schemas:

1. Identify equivalent fields
2. Handle missing fields (make optional or provide defaults)
3. Transform data types if needed
4. Map enumerations

**Example Mapping:**

```javascript
// Your internal model
{
  mine_id: "M001",
  mine_name: "Kivu Mine",
  country: "RW",
  location: { lat: -1.94, lng: 29.87 },
  status: "Certified"
}

// ICGLR format
{
  icglr_id: "RW-1.9400+30.8700-00001",
  address_country: "RW",
  national_id: "M001",
  certification_status: 1,  // 1 = Green (Certified)
  activity_status: 1,        // 1 = Active
  mine_site_location: {
    geolocalization: {
      latitude: -1.94,
      longitude: 30.87
    },
    national_cadaster_localization: "...",
    local_geographic_designation: {
      country: "RW",
      subnational_division_l1: "RW-02",
      address_locality: "Muhanga"
    }
  },
  mineral: ["IMA1960-001"],
  license: [...],
  owner: {...}
}
```

#### Step 4: Implement Validation

```javascript
const validator = require('./conformance/validators/schema-validator');

function createMineSite(req, res) {
  // Validate against JSON schema
  const result = validator.validate(req.body, 'mine-site');
  
  if (!result.valid) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: result.errors
    });
  }
  
  // Validate ICGLR ID format
  const icglrIdPattern = /^[A-Z]{2}-[+-]?[0-9]+\.[0-9]{4}[+-][0-9]+\.[0-9]{4}-[0-9]+$/;
  if (!icglrIdPattern.test(req.body.icglr_id)) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid ICGLR ID format. Expected: CC-[Lat]-[Long]-NNNNN'
    });
  }
  
  // Process valid data...
}
```

#### Step 5: Implement Endpoints

Follow the OpenAPI specification for:
- Request/response formats
- HTTP status codes
- Error handling
- Pagination
- Filtering

#### Step 6: Error Handling

Implement consistent error handling:

```javascript
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
    timestamp: new Date().toISOString()
  });
}
```

### Conformance Rules

#### Level 1: Basic Conformance (REQUIRED)

**JSON Schema Validation:**
- All data structures MUST validate against JSON schemas
- All required fields MUST be present
- Data types MUST match schema definitions
- Enum values MUST be from allowed sets

**Identifier Structure:**
- Mine Sites MUST use `icglr_id` with format `CC-[Lat]-[Long]-NNNNN`
- All identifiers MUST be unique
- Field names MUST use snake_case convention

**Geographic Data:**
- All location data MUST include `geolocalization` with `latitude` and `longitude`
- Latitude MUST be between -90 and 90
- Longitude MUST be between -180 and 180
- Coordinates MUST use decimal degrees (WGS84) with 4 decimal places
- Address MUST use ISO 3166-2 format for subnational divisions

**Date and Time Formats:**
- All dates MUST use ISO 8601 format (YYYY-MM-DD)
- All date-times MUST use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Time zones MUST be specified (preferably UTC)

**ICGLR Member State Codes:**
- Country codes MUST use ISO 3166-1 alpha-2 format
- Only ICGLR member state codes allowed: AO, BI, CD, CF, CG, KE, RW, SS, SD, TZ, UG, ZM

**Naming Convention:**
- All technical field names MUST use snake_case convention
- Examples: `icglr_id`, `certification_status`, `mine_site_location`
- NO camelCase or PascalCase in field names

**Code Lists:**
- Certification Status: 0=Blue, 1=Green, 2=Yellow, 3=Red (integers)
- Activity Status: 0=Abandoned, 1=Active, 2=Non-active (integers)
- CoC Roles: 1-8 (integers)
- Originating Operations: 1-8 (integers)
- Mineral codes: HS Codes or IMA Codes

#### Level 2: API Endpoint Conformance (REQUIRED)

**OpenAPI Specification:**
- API MUST implement endpoints as defined in `api/openapi.yaml`
- HTTP methods MUST match OpenAPI specification
- Request/response formats MUST match OpenAPI schemas
- Status codes MUST follow REST conventions

**Required Endpoints:**
- Mine Sites: `GET /mine-sites`, `GET /mine-sites/{icglr_id}`, `POST /mine-sites`, `PUT /mine-sites/{icglr_id}`
- Export Certificates: `GET /export-certificates`, `GET /export-certificates/{identifier}`, `POST /export-certificates`
- Lots: `GET /lots`, `GET /lots/{lot_number}`, `POST /lots`

**Pagination:**
- List endpoints MUST support pagination
- Use `page` and `limit` query parameters
- Response MUST include pagination metadata

**Filtering:**
- Support filtering as specified in OpenAPI
- Filter by status codes, mineral codes, dates, etc.

#### Level 3: JSON-LD Support (RECOMMENDED)

- Support `application/ld+json` content type
- Include `@context` in responses
- Use vocabulary from `json-ld/context.jsonld`

#### Level 4: GraphQL Support (OPTIONAL)

- Implement GraphQL endpoint
- Support flexible querying
- Enable federation

### Development Guide

#### Using the Reference Implementation

The `api-server/` directory contains a complete reference implementation:

1. **Generate API Server:**
   ```bash
   cd api-server
   npm install
   npm run api:generate
   ```

2. **Generate Database Schema:**
   ```bash
   npm run db:generate
   ```

3. **Seed Database:**
   ```bash
   npm run db:seed
   ```

4. **Start Server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

#### Project Structure

```
api-server/
├── src/
│   ├── server.js              # Main server file
│   ├── routes/                # API route handlers
│   │   ├── mine-sites.js
│   │   ├── export-certificates.js
│   │   ├── lots.js
│   │   ├── graphql.js
│   │   └── health.js
│   ├── services/              # Business logic
│   │   ├── mine-sites.js
│   │   ├── export-certificates.js
│   │   └── lots.js
│   ├── middleware/           # Validation & error handling
│   │   ├── validation.js
│   │   └── error-handler.js
│   └── database/             # Database connection
│       └── index.js
├── scripts/
│   ├── generate-api.js        # Generate API from OpenAPI
│   ├── generate-db-schema.js   # Generate DB from schemas
│   └── seed.js                # Seed database
├── data/                      # SQLite database
└── package.json
```

#### Key Features

**Auto-Generated Code:**
- Routes generated from OpenAPI specification
- Services with database operations
- Validation middleware
- Error handling

**Database Integration:**
- SQLite database with auto-generated schema
- Full CRUD operations
- Pagination and filtering
- Transaction support

**Validation:**
- JSON Schema validation
- ICGLR ID format validation
- Status code validation
- Date/time format validation

**Swagger UI:**
- Interactive API documentation
- Try-it-out functionality
- Schema documentation

#### Customization

After generating the API, you can customize:

1. **Business Logic**: Edit files in `src/services/`
2. **Validation Rules**: Modify `src/middleware/validation.js`
3. **Error Handling**: Update `src/middleware/error-handler.js`
4. **Database Queries**: Adjust service methods

**Note:** Regenerating the API will overwrite generated files. Keep customizations in separate files or use a different approach.

#### Testing

```bash
# Run validation tests
node conformance/validators/schema-validator.js mine-site examples/json/mine-site-example.json

# Test API endpoints
curl http://localhost:3000/mine-sites
curl http://localhost:3000/health
```

#### Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

**Environment Variables:**
```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=./data/icglr.db
JWT_SECRET=your-secret-key
```

### Key Technical Concepts

#### ICGLR ID Format

Mine sites use a standardized ICGLR Mine Site Identification Number format:
```
CC-[Lat]-[Long]-NNNNN
```

**Example:** `RW-1.9641+30.0619-00001`
- `RW`: Country code (Rwanda) - ISO 3166-1 alpha-2
- `1.9641`: Latitude with 4 decimals (WGS 84, no cardinal point)
- `+30.0619`: Longitude with 4 decimals (sign included, no cardinal point)
- `00001`: Sequential number

**Design Rationale:**
- The format is "offline-friendly" - can be generated without requiring technical system processing
- Uses geocoordinates already required by RCM, ensuring automatic generation and uniqueness
- Independent of any attribute changes (certification status, activity status, licenses, owner, inspections)
- Simple, linear, predictive, sequential approach
- Stored identically at country level and ICGLR level for direct identification

**Validation Pattern:**
```regex
^[A-Z]{2}-[+-]?[0-9]+\.[0-9]{4}[+-][0-9]+\.[0-9]{4}-[0-9]+$
```

**Business Term**: ICGLR Identification number  
**Technical Term**: `icglr_id`  
**Cardinality**: 1..1 (Required, only once)

#### Snake Case Naming

All field names use snake_case:
- ✅ `icglr_id`
- ✅ `certification_status`
- ✅ `mine_site_location`
- ✅ `date_of_issuance`
- ❌ `icglrId` (camelCase)
- ❌ `CertificationStatus` (PascalCase)

#### Status Codes

Use integer codes for language independence:

**Certification Status:**
- `0` = Blue
- `1` = Green
- `2` = Yellow
- `3` = Red

**Activity Status:**
- `0` = Abandoned
- `1` = Active
- `2` = Non-active

**CoC Roles:**
- `1` = Miner
- `2` = Trader
- `3` = Shipper
- `4` = Processor
- `5` = Warehouse
- `6` = Importer
- `7` = Exporter
- `8` = Government

**Originating Operations:**
- `1` = Production
- `2` = Purchase
- `3` = Combination
- `4` = Processing
- `5` = Transportation
- `6` = Storage/Warehousing
- `7` = Import
- `8` = Export

#### Mineral Codes

Support for two code systems:

**HS Codes (Harmonized System):**
- Gold: `7108.12.00`
- Cassiterite: `2609.00.00`
- Wolframite: `2611.00.00`
- Coltan: `2615.90.00`

**IMA Codes (International Mineralogical Association):**
- Gold: `IMA1960-A`
- Cassiterite: `IMA1960-001`
- Wolframite: `IMA2000-014`
- Coltan: `IMA1979-A`

#### Chain of Custody

The Lot entity (MD.12) supports complete Chain of Custody tracking:

**Key Features:**
- Recursive `input_lot` references for transformations
- Conditional requirements (e.g., `mine_site_id` and `tag` required for Production)
- Support for all CoC operations
- Tax payment tracking
- Transformation support (1-to-1, 1-to-n, n-to-1, n-to-n)

**Example Flow:**
```
Mine Site → Lot (Production) → Lot (Processing) → Lot (Export) → Export Certificate
```

### Standards Compliance

This implementation follows:

- **ISO 3166-1**: Country codes (alpha-2) - Two-letter country codes
- **ISO 3166-2**: Subnational division codes - Format: `CC-XX` (e.g., `RW-02` for Southern Province, Rwanda)
- **ISO 8601**: Date and time formats - Calendar date complete representation (YYYY-MM-DD)
- **ISO 15000-5:2014, Annex B**: Primitive types - Date, Decimal, String, Identifier
- **WGS 84**: Geographic coordinates - Decimal degrees with 4 decimals, no cardinal points
- **UN/ECE Recommendation N°. 20**: Units of measure - Codes for Units of Measure Used in International Trade
- **UPU S42 / ISO 19160-1**: Locality designation standards
- **ISO 4217**: Currency codes (3-letter codes)
- **JSON Schema Draft 7**: Schema validation
- **OpenAPI 3.0.3**: API specification
- **JSON-LD 1.1**: Linked data

### Adoption and Implementation Considerations

**For ICGLR:**
- Development and formal adoption of the standard
- Establish access policy for the standard and its components
- Support member states in adopting the standard
- Validate correct implementation to ensure interoperability
- Maintain validation artifacts and tools
- Maintain and update the standard with transition terms

**For Member States:**
The standard can be used in three ways:

1. **Technical Mapping**: Map national mining data to the ICGLR data model for interoperability
2. **Extension**: Add new entities and attributes without altering the core model
3. **Derivation**: Add extensions and documented exceptions (may challenge interoperability)
4. **Usage Specification**: Impose additional rules on formatting, size, or values (must not break compatibility)

**National Lifecycle:**
- Adoption as national standard (possibly translated)
- Definition of Standard Usage Specification
- Extension of the standard with national-specific entities/attributes
- Maintenance following regional standard updates

**Important Note**: The semantic model is technology-independent. It can be represented as:
- SQL-based database (for RDBMF)
- JSON or JSON-LD (for APIs)
- XML (for batch transfers)
- Any format that allows semantic validation

### Examples

See `examples/` directory for:
- JSON data examples
- API request examples
- Chain of Custody transformations

### Support and Resources

- **Documentation**: See `docs/` directory
- **Examples**: See `examples/` directory
- **Conformance Rules**: See `conformance/rules.md`
- **Architecture**: See `docs/architecture.md`
- **Implementation Guide**: See `docs/implementation-guide.md`

### Version Information

- **Version**: 1.0.0
- **Status**: Ready for Review
- **Author**: Daniel Homorodean
- **Based on**: ICGLR Data Sharing Protocol Standards semantic model (DOCUMENTATION.txt)
- **Development Period**: 
  - Phase 1: October 2024 - March 2025
  - Phase 2: October 2025 - December 2025
- **Validation**: ICGLR Technical Working Group, Lusaka, 18-20 March 2025

### License

[To be determined by ICGLR]

### Contact

For questions or feedback, contact the ICGLR Secretariat.

---

## Conclusion

This documentation provides a complete guide to the ICGLR Mining Sector Data Sharing Protocol Standards, from high-level concepts for non-technical readers to detailed technical specifications for implementers. The standard enables interoperability, transparency, and compliance in the mining sector across ICGLR member states.

For additional information, refer to:
- `README.md` - Project overview
- `PROJECT_SUMMARY.md` - Project status
- `docs/architecture.md` - Architecture details
- `docs/implementation-guide.md` - Implementation steps
- `conformance/rules.md` - Conformance requirements


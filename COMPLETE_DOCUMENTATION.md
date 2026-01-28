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

### Component Overview and Usage

#### JSON Schemas: Data Structure Definitions

**What it is:**
JSON Schemas are machine-readable documents that define the structure, format, and validation rules for all data entities in the ICGLR standard. They specify what fields are required, what data types are allowed, what values are valid, and how data should be formatted.

**Location:** `schemas/` directory

**What it's used for:**
- **Data Validation**: Validate incoming and outgoing data to ensure it conforms to the standard
- **Documentation**: Serve as authoritative documentation of data structures
- **Code Generation**: Generate database schemas, API models, and client libraries
- **Type Safety**: Ensure type consistency across different implementations
- **Interoperability**: Guarantee that data from one system can be understood by another

**How to use it:**

1. **Validate Data:**
   ```bash
   # Using the validation tool
   node conformance/validators/schema-validator.js mine-site your-data.json
   ```

2. **In Your Application:**
   ```javascript
   const Ajv = require('ajv');
   const ajv = new Ajv();
   const schema = require('./schemas/mine-site/mine-site.json');
   const validate = ajv.compile(schema);
   
   const data = { icglrId: "RW-1.9641+30.0619-00001", ... };
   const valid = validate(data);
   if (!valid) {
     console.log(validate.errors);
   }
   ```

3. **Generate Database Schema:**
   ```bash
   cd api-server
   npm run db:generate
   # This reads JSON schemas and generates SQLite database schema
   ```

4. **Reference in Code:**
   - Use schemas to understand required fields before creating data
   - Validate API requests and responses
   - Generate forms and UI components automatically
   - Create API documentation

**Key Features:**
- Defines all entities (Mine Site, Export Certificate, Lot, etc.)
- Specifies cardinality (required/optional, single/multiple)
- Validates formats (ICGLR ID, dates, coordinates)
- Enforces code lists (status codes, mineral codes)
- Language-independent validation

---

#### OpenAPI Specification: API Endpoint Definitions

**What it is:**
OpenAPI (formerly Swagger) is a standard format for describing RESTful APIs. The OpenAPI specification file defines all available endpoints, request/response formats, authentication methods, and error codes in a machine-readable format.

**Location:** `api/openapi.yaml`

**What it's used for:**
- **API Documentation**: Generate interactive API documentation (Swagger UI)
- **Code Generation**: Generate server stubs and client libraries automatically
- **API Testing**: Test APIs directly from documentation
- **Contract Definition**: Serve as a contract between API providers and consumers
- **Validation**: Validate API requests and responses against the specification

**How to use it:**

1. **View Interactive Documentation:**
   ```bash
   # Start the API server
   cd api-server && npm start
   # Visit http://localhost:3000/api-docs
   # This shows Swagger UI with all endpoints, try-it-out functionality
   ```

2. **Generate API Server:**
   ```bash
   cd api-server
   npm run api:generate
   # This reads openapi.yaml and generates Express.js routes, handlers, and services
   ```

3. **Generate Client Libraries:**
   ```bash
   # Using OpenAPI Generator
   npx @openapitools/openapi-generator-cli generate \
     -i api/openapi.yaml \
     -g javascript \
     -o client-js
   ```

4. **Validate API Requests:**
   - Use tools like Swagger Codegen or OpenAPI Generator
   - Validate requests against the specification before sending
   - Generate type-safe client code

5. **API Testing:**
   - Use Swagger UI to test endpoints interactively
   - Generate test cases from the specification
   - Validate responses match the specification

**Key Features:**
- Complete endpoint definitions (GET, POST, PUT for all resources)
- Request/response schemas with examples
- Authentication methods (JWT, API Key)
- Error response formats
- Query parameters and filtering options
- Pagination specifications

**Example Usage:**
```yaml
# From openapi.yaml
paths:
  /mine-sites:
    get:
      summary: List mine sites
      parameters:
        - name: addressCountry
          in: query
          schema:
            $ref: '#/components/schemas/ICGLRMemberState'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MineSiteListResponse'
```

---

#### Reference Implementation: Working API Server

**What it is:**
A complete, working API server implementation that demonstrates how to implement the ICGLR standard. It includes a fully functional Express.js server with all endpoints, database integration, validation, and error handling.

**Location:** `api-server/` directory

**What it's used for:**
- **Learning**: Understand how to implement the standard
- **Testing**: Test API functionality locally
- **Development**: Use as a starting point for your own implementation
- **Demonstration**: Show stakeholders how the API works
- **Integration Testing**: Test client applications against a working server

**How to use it:**

1. **Quick Start:**
   ```bash
   cd api-server
   npm install
   npm run db:generate    # Generate database schema
   npm run api:generate   # Generate API from OpenAPI spec
   npm run db:seed        # (Optional) Load example data
   npm start              # Start server
   ```

2. **Access the API:**
   - API Base: `http://localhost:3000`
   - Swagger UI: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/health`

3. **Test Endpoints:**
   ```bash
   # List mine sites
   curl http://localhost:3000/mine-sites
   
   # Create a mine site
   curl -X POST http://localhost:3000/mine-sites \
     -H "Content-Type: application/json" \
     -d @../examples/json/mine-site-example.json
   ```

4. **Customize for Your Needs:**
   - Modify `src/services/` for business logic
   - Update `src/middleware/` for custom validation
   - Change database in `src/database/`
   - Add authentication in `src/middleware/`

5. **Use as Reference:**
   - Study how endpoints are implemented
   - See how validation is performed
   - Understand error handling patterns
   - Learn database integration approach

**Key Features:**
- Auto-generated from OpenAPI specification
- SQLite database with auto-generated schema
- JSON Schema validation
- Swagger UI documentation
- Complete CRUD operations
- Pagination and filtering
- Error handling

**Architecture:**
```
api-server/
├── src/
│   ├── server.js          # Main Express app
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   ├── middleware/       # Validation & error handling
│   └── database/         # Database connection
├── scripts/
│   ├── generate-api.js   # Generate API from OpenAPI
│   └── generate-db-schema.js  # Generate DB from schemas
└── data/                 # SQLite database
```

---

#### Validation Tools: Conformance Checking

**What it is:**
Tools and scripts that verify data and implementations conform to the ICGLR standard. These tools check JSON Schema compliance, validate data formats, and ensure implementations meet conformance requirements.

**Location:** `conformance/` directory

**What it's used for:**
- **Data Validation**: Verify data files conform to JSON schemas
- **Conformance Testing**: Ensure implementations meet standard requirements
- **Quality Assurance**: Catch errors before data exchange
- **Certification**: Validate systems for ICGLR certification
- **Development**: Test data during development

**How to use it:**

1. **Validate JSON Data:**
   ```bash
   # Validate a mine site JSON file
   node conformance/validators/schema-validator.js mine-site examples/json/mine-site-example.json
   
   # Validate export certificate
   node conformance/validators/schema-validator.js export-certificate examples/json/export-certificate-example.json
   
   # Validate lot
   node conformance/validators/schema-validator.js lot examples/json/lot-example.json
   ```

2. **In Your Application:**
   ```javascript
   const validator = require('./conformance/validators/schema-validator');
   
   // Validate data before sending to API
   const result = validator.validate(data, 'mine-site');
   if (!result.valid) {
     console.error('Validation errors:', result.errors);
     // Handle errors
   }
   ```

3. **Automated Testing:**
   ```javascript
   // In your test suite
   describe('Data Validation', () => {
     it('should validate mine site data', () => {
       const data = loadTestData('mine-site.json');
       const result = validator.validate(data, 'mine-site');
       expect(result.valid).toBe(true);
     });
   });
   ```

4. **CI/CD Integration:**
   ```yaml
   # GitHub Actions example
   - name: Validate Data
     run: |
       node conformance/validators/schema-validator.js mine-site data/mine-sites.json
   ```

5. **Check Conformance Levels:**
   - Review `conformance/rules.md` for requirements
   - Use validators to check Level 1 (Basic Conformance)
   - Test API endpoints for Level 2 (API Conformance)
   - Verify JSON-LD support for Level 3
   - Test GraphQL for Level 4

**Key Features:**
- JSON Schema validation
- ICGLR ID format validation
- Status code validation
- Date/time format validation
- Coordinate validation
- Error reporting with details

**Validation Checks:**
- Required fields present
- Data types correct
- Enum values valid
- Format patterns match (ICGLR ID, dates, etc.)
- Cardinality rules followed
- Code list values correct

---

#### Documentation: Complete Guides and Examples

**What it is:**
Comprehensive documentation including guides, examples, architecture descriptions, and implementation instructions. This includes both human-readable documentation and executable examples.

**Location:** Multiple files including `COMPLETE_DOCUMENTATION.md`, `docs/`, `examples/`

**What it's used for:**
- **Learning**: Understand the standard and how to implement it
- **Reference**: Look up specific information quickly
- **Examples**: See working examples of data structures and API calls
- **Onboarding**: Help new developers understand the project
- **Training**: Train team members on the standard

**How to use it:**

1. **Read Complete Documentation:**
   ```bash
   # Open COMPLETE_DOCUMENTATION.md
   # Contains everything from introduction to technical details
   ```

2. **Study Examples:**
   ```bash
   # View JSON examples
   cat examples/json/mine-site-example.json
   cat examples/json/export-certificate-example.json
   cat examples/json/lot-example.json
   ```

3. **Follow Implementation Guide:**
   ```bash
   # Read step-by-step guide
   cat docs/implementation-guide.md
   ```

4. **Review Architecture:**
   ```bash
   # Understand system design
   cat docs/architecture.md
   ```

5. **Use API Examples:**
   ```bash
   # See API request examples
   cat examples/requests/api-request-examples.md
   ```

6. **Reference During Development:**
   - Keep documentation open while coding
   - Copy examples as starting points
   - Reference code lists and formats
   - Check conformance rules

**Documentation Structure:**

- **COMPLETE_DOCUMENTATION.md**: Single comprehensive document
  - Introduction for non-technical readers
  - Technical documentation
  - API reference
  - Implementation guide

- **docs/architecture.md**: System architecture and design
  - Design principles
  - Architecture layers
  - Data flow diagrams
  - Component details

- **docs/implementation-guide.md**: Step-by-step implementation
  - Quick start
  - Implementation steps
  - Code examples
  - Best practices

- **examples/json/**: JSON data examples
  - `mine-site-example.json`: Complete mine site example
  - `export-certificate-example.json`: Export certificate example
  - `lot-example.json`: Chain of Custody lot example
  - `lot-transformation-example.json`: Lot transformation example

- **examples/requests/**: API usage examples
  - HTTP request examples
  - cURL commands
  - Response examples
  - Error handling examples

- **conformance/rules.md**: Conformance requirements
  - Level 1-4 requirements
  - Validation rules
  - Certification process

**Example Usage:**
```javascript
// Copy from examples/json/mine-site-example.json
const mineSite = {
  "icglrId": "RW-1.9641+30.0619-00001",
  "addressCountry": "RW",
  "certificationStatus": 1,
  // ... rest from example
};

// Use in your code
const response = await fetch('/mine-sites', {
  method: 'POST',
  body: JSON.stringify(mineSite),
  headers: { 'Content-Type': 'application/json' }
});
```

**Key Benefits:**
- Reduces learning curve
- Provides working examples
- Ensures correct implementation
- Saves development time
- Promotes best practices

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
- **Technical Terms**: Transcriptions of business terms in `camelCase` (e.g., `icglrId`)
- The standard uses `camelCase` as it is the most human-readable and aligns with other standardization initiatives (e.g., https://spdci.org/)

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

#### Code Lists (MDC.01 - MDC.07)

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

**MDC.07 Unit of Measurement** (String codes, UN/ECE Recommendation N°. 20):
- `TNE` = tonne
- `KGM` = kilogram

*Note: The unit of measure shall be chosen from the lists in UN/ECE Recommendation N°. 20 "Codes for Units of Measure Used in International Trade". Used for lot weight/mass measurements in Lot and Export Certificate entities.*

### Detailed Entity Descriptions

#### MD.01 Mine Site

The Mine Site is a primary entity representing a physical location where mining occurs. Key attributes include:

- **icglrId** (Business Term: ICGLR Identification number): Unique identifier in format `CC-[Lat]-[Long]-NNNNN` (required, Identifier)
- **addressCountry** (Business Term: Country): ISO 3166-1 alpha-2 country code (required, Identifier)
- **nationalId** (Business Term: National Identification Number): Unique identifier at country level (required, Identifier)
- **certificationStatus**: Current certification status (required, references MDC.01). Should be: 1,2,3 (corresponding to Green, Yellow, Red) and 0 can be used additionally for new mines which were not yet inspected
- **activityStatus**: Mining activity status (required, references MDC.02). 1=active, 2=non-active, 0=abandoned
- **mineSiteLocation**: Geographic location (1..n, required, references MD.08) - A mine site can have multiple locations
- **mineral**: Array of minerals produced (1..n, required, references MDC.03). Takes values strictly from the HS Code classification. For designated minerals: 7108.12.00 (Gold), 2609.00.00 (Cassiterite), 2611.00.00 (Wolframite), 2615.90.00 (Columbite-Tantalite/Coltan)
- **license**: Array of licenses (1..n, required, references MD.02). Every mine site has a License field, even when the mine site is unlicensed. This is illustrated by the license type attribute of License entity
- **owner**: Business entity that owns the mine (1..1, required, references MD.04)
- **operator**: Array of operators if different from owner (0..n, optional, references MD.04)
- **inspection**: Array of inspections (0..n, optional, references MD.07)
- **statusChange**: Array of status changes (0..n, optional, references MD.10)

**Certification Status Notes:**
- Blue status (0) can be valid for 3 years, otherwise the mine site turns red
- A site has blue status either because it is not yet inspected or because green status validity has expired after one year

#### MD.03 Export Certificate

The Export Certificate represents an ICGLR Regional Certificate issued for mineral exports. Key attributes include:

- **issuingCountry**: ISO 3166-1 alpha-2 country code
- **identifier**: Unique serial number (unique in the country)
- **exporter**: Business entity (references MD.04)
- **importer**: Business entity (references MD.04)
- **lotNumber**: Exporter's unique lot number
- **designatedMineralDescription**: Textual description (optional)
- **typeOfOre**: Mineral code (references MDC.03)
- **lotWeight**: Numeric value (Decimal)
- **lotWeightUOM**: Unit of measure (MDC.07, UN/ECE Recommendation N°. 20)
- **lotGrade**: Grade expression (varies by mineral)
- **mineralOrigin**: Country codes separated by semicolon (e.g., `CD;BI;RW`), can include `0` for unknown
- **customsValue**: Declared value in USD (String with currency code or Decimal)
- **dateOfShipment**: Planned shipment date
- **shipmentRoute**: ISO 3166 codes separated by semicolon (optional)
- **transportCompany**: Transport company name (optional)
- **memberStateIssuingAuthority**: Issuing authority name
- **nameOfVerifier**: Verifier's name
- **positionOfVerifier**: Verifier's position
- **idOfVerifier**: Verifier's ID (optional)
- **dateOfVerification**: Verification date
- **nameOfValidator**: Validator's name
- **dateOfIssuance**: Certificate countersign date
- **dateOfExpiration**: Expiration date (no more than 90 days from issuance)
- **certificateFile**: Certificate as file

**Important Notes:**
- The certificate should allow regeneration in any language (RCM requires English and French)
- Mineral origin uses semicolon-separated country codes (e.g., `CD;BI;RW`), not the word "mixed". In case the origin is not known, the character zero (0) will be used
- Date of expiration is stored directly (not computed from validity period) to avoid ambiguity

#### MD.12 Lot (Chain of Custody)

The Lot entity is central to Chain of Custody tracking. It represents a holder of a quantity of minerals that are mined, intended for transport, processing, or sale.

**Key Attributes:**
- **lotNumber**: Lot number given by CoC actor (required, Identifier)
- **dateRegistration**: Date when the registration was created (required, Date)
- **timeRegistration**: Time when the registration was created (required, Time format: hhmmss)
- **creator**: Business entity that created the lot (current custodian, required, references MD.04)
- **mineral**: Contained mineral identifier (required, references MDC.03)
- **concentration**: Approximate mineral concentration (grade) in percent (required, Decimal)
- **mass**: Lot weight (required, Decimal)
- **packageType**: Type of packaging (optional, String)
- **nrOfPackages**: Number of packages (optional, Decimal) - In case a lot is composed of more packages
- **unitOfMeasurement**: Unit of measure (required, MDC.07, UN/ECE Recommendation N°. 20)
- **mineSiteId**: Mine site identifier (REQUIRED when originatingOperation includes Production, optional otherwise, references MD.01)
- **creatorRole**: Array of CoC roles (1..n, required, references MDC.05)
- **recipient**: Lot recipient business entity (0..1, optional, references MD.04)
- **originatingOperation**: Array of operations (1..n, required, references MDC.06)
- **inputLot**: Array of lots that form this lot (0..n, recursive reference to MD.12) - This attribute does not exist for the initial Lot (the one registered at the Mine Site)
- **tag**: Associated tag (REQUIRED when originatingOperation includes Production, optional otherwise, references MD.11)
- **taxPaid**: Array of taxes paid (0..n, references MD.13)
- **dateSealed**: Date when lot is sealed (optional)
- **dateShipped**: Date when lot is shipped (optional)
- **purchaseNumber**: Purchase order number (optional, for purchases)
- **purchaseDate**: Purchase date (optional)
- **responsibleStaff**: Name of responsible staff (optional, String)
- **dateIn**: Date received by processor (optional)
- **transportationMethod**: Transportation method (optional)
- **transportationRoute**: Transportation route (optional)
- **transportCompany**: Transport company (optional)
- **exportCertificateId**: ICGLR Certificate number if for export (optional, references MD.03)

**Key Rules:**
1. Time of registration (`timeRegistration`) is automatically generated by the software system
2. Information from previous CoC stages should be retained in the Lot record
3. A Lot registered at Production might not have "dateShipped" initially, but must include it when referenced by another Lot
4. If originatingOperation includes Production (1), then `mineSiteId` and `tag` are REQUIRED
5. If there is no transformation, except for changing actors in the CoC, the `inputLot` is itself
6. The `inputLot` attribute does not exist for the initial Lot (the one registered at the Mine Site)

**Lot Transformations:**
The model supports all types of lot-to-lot transformations:
- 1-to-1: Single lot becomes single lot
- 1-to-n: Single lot splits into multiple lots
- n-to-1: Multiple lots combine into single lot
- n-to-n: Multiple lots transform into multiple lots

#### MD.04 Business Entity

Represents companies and organizations involved in mining operations. Attributes include:

- **identifier**: Unique identification number (required)
- **name**: Legal name as officially registered (required)
- **legalAddress**: Legal address (optional, references MD.05 Address)
- **physicalAddress**: Physical address (optional, references MD.05 Address)
- **tin**: Tax ID Number in country of registration (required, Identifier). If not known, N/A can be used as value
- **contactDetails**: Contact details (required, references MD.09 Contact Details)

**Special Rules:**
- Either Legal Address or Physical Address should exist
- In case one of Legal Address or Physical Address exists while the other does not, whenever the missing term is required, the value of the existing one should be retrieved, considering thus that both addresses are the same

#### MD.02 License

Mining license information:

- **licenseType**: The type of mineral license covering the mine site (required, references MDC.04 License Type)
- **licenseId**: The identification number of the mining license (optional, Identifier)
- **owner**: The owner of the mineral license (optional, references MD.04 Business Entity)
- **appliedDate**: Date Applied (optional, Date)
- **grantedDate**: Date Granted (optional, Date)
- **expiringDate**: Date expiring (optional, Date)
- **licenseStatus**: License status - 1 Active or 0 Non-Active (Expired or Revoked) (optional, Integer)
- **coveredCommodities**: Array of covered commodities (1..n, references MDC.03 Mineral)

**Special Rules:**
- Unless License type is "unlicensed", or not available in the case of artisanal and small-scale miners, License ID and Owner must be filled
- License ID and Owner should always be present when the license type takes value from (claim, exploration_permit, mining_license)
- The Active status can alternatively be determined from the difference of Date granted and Date expiring, in case the attributes are used

#### MD.05 Address

Address information using ISO standards:

- **country**: ISO 3166-1 alpha-2 country code (required)
- **subnationalDivisionL1**: ISO 3166-2 code (e.g., "RW-02", optional)
- **subnationalDivisionL1Text**: Textual name (optional)
- **subnationalDivisionL2**: Level 2 subdivision (optional)
- **subnationalDivisionL3**: Level 3 subdivision (optional)
- **subnationalDivisionL4**: Level 4 subdivision (optional)
- **addressLocalityText**: Locality as free text (required)
- **addressLocalityCode**: Locality as code (optional)

#### MD.06 Geolocalization

Geographic coordinates:

- **latitude**: Latitude in WGS 84 format, decimal degrees with 4 decimals (-90 to 90)
- **longitude**: Longitude in WGS 84 format, decimal degrees with 4 decimals (-180 to 180)

#### MD.07 Inspection

Mine site inspection records:

- **inspectionId**: Generated identifier (required, Identifier). Example: "PS-2025-12-02-16-03" for inspector initials and timestamp
- **inspectionDate**: Date of inspection (required, Date)
- **inspectionResult**: The result of the inspection in changing or maintaining the certification status (required, references MDC.01 Certification Status)
- **inspectionReport**: Full inspection report (optional, File). MIME type should take value from: application/pdf, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- **inspectionPurpose**: Inspection purpose - short text (optional, String)
- **inspectionResults**: Inspection results - long text (optional, String)
- **inspectorName**: Inspector name - full name (required, String)
- **inspectorPosition**: Inspector position - title or position (required, String)
- **governmentAgency**: Government Agency - short text (optional, String)
- **governmentId**: Government ID - Government identification number, if applicable (optional, Identifier)

**Important Notes:**
- The "Inspection number" (inspectionId) is not mandated by the RCM manual, but it is highly useful as a single unique identifier, particularly in the context of data storage, reporting and querying. Its addition was recommended by the ICGLR secretariat technical team
- Usage of the File element (inspectionReport) should not be treated lightly because it is one of the most important causes for the growth of storage space on medium and long run, and can also generate risks in the data transfers between countries and ICGLR, as the data batches will grow larger and will be more prone to transaction errors due to the long time of transfer in low bandwidth conditions
- The current practice remains that the reports are scanned and stored as files, which tend to have relatively large sizes. Therefore, one usage rule that we can expect to be imposed by member states is the limiting of the size of the files to be uploaded and exchanged in the system

#### MD.08 Mine Site Location

Location information for a mine site:

- **geolocalization**: Geographic localization in WGS 84 format (references MD.06, required)
- **nationalCadasterLocalization**: National cadaster localization (optional, String)
- **localGeographicDesignation**: Local geographic designation (optional, references MD.05 Address)
- **polygon**: Polygonal representation of the site as GeoJSON Polygon (optional, GeoJSON object)
- **altitude**: Average altitude of the mine site in meters (optional, Decimal)

#### MD.09 Contact Details

Contact information for business entities:

- **legalRepresentative**: Legal representative name (First name and last name, required)
- **contactPhoneNumber**: Contact phone number (E.164 format, starting with +, followed by country code and national number, maximum 15 digits, required)
- **contactEmail**: Contact email (format: text@domain.extension, required)

*Note: At implementation, RegEx can be used for email validation, such as `^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$`*

#### MD.10 Status History

History of certification status changes:

- **dateOfChange**: Date of status change (required, Date)
- **newStatus**: The status acquired after the change (required, references MDC.01 Certification Status)

*Note: The status history should be reconstructed from intervals between status history records. Each status change appends the required information that allows an interpreting system to reconstruct the entire chain of changes.*

#### MD.11 Tag

Tag attached to a Lot:

- **identifier**: Unique ID (can be QR code, barcode, numeric)
- **issuer**: Organization that issued the tag (references MD.04)
- **issueDate**: Date when tag was created
- **issueTime**: Time when tag was created (format: hhmmss)

#### MD.13 Tax

Tax payment information:

- **taxType**: Textual description of tax type
- **taxAmount**: Value of paid tax (Decimal)
- **currency**: Currency code (ISO 4217, 3 letters)
- **taxAuthority**: Authority who imposed the tax (optional)
- **taxPaidDate**: Date when the tax was paid (optional)
- **receiptReference**: Receipt number or other form of reference (optional)

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
- `addressCountry` (string): Filter by ICGLR member state code
- `certificationStatus` (integer): Filter by certification status (0-3)
- `activityStatus` (integer): Filter by activity status (0-2)
- `mineral` (string): Filter by mineral code
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "icglrId": "RW-1.9641+30.0619-00001",
      "addressCountry": "RW",
      "nationalId": "MINE-001",
      "certificationStatus": 1,
      "activityStatus": 1,
      "mineSiteLocation": { ... },
      "mineral": ["2609.00.00"],
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
GET /mine-sites/{icglrId}
```

**Path Parameters:**
- `icglrId` (string): ICGLR mine site ID (format: `CC-[Lat]-[Long]-NNNNN`)

**Response:**
```json
{
  "icglrId": "RW-1.9641+30.0619-00001",
  "addressCountry": "RW",
  "nationalId": "MINE-001",
  "certificationStatus": 1,
  "activityStatus": 1,
  "mineSiteLocation": { ... },
  "mineral": ["2609.00.00"],
  "license": [ ... ],
  "owner": { ... },
  "operator": [ ... ],
  "inspection": [ ... ],
  "statusChange": [ ... ]
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
  "icglrId": "RW-1.9641+30.0619-00001",
  "addressCountry": "RW",
  "nationalId": "MINE-001",
  "certificationStatus": 1,
  "activityStatus": 1,
  "mineSiteLocation": {
    "geolocalization": {
      "latitude": -1.9641,
      "longitude": 30.0619
    },
    "nationalCadasterLocalization": "CAD-12345",
    "localGeographicDesignation": {
      "country": "RW",
      "subnationalDivisionL1": "RW-02",
      "addressLocalityText": "Muhanga"
    }
  },
  "mineral": ["2609.00.00"],
  "license": [ ... ],
  "owner": { ... }
}
```

**Response:** `201 Created` with the created mine site

##### Update Mine Site

```http
PUT /mine-sites/{icglrId}
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
- `issuingCountry` (string): Filter by issuing country
- `identifier` (string): Filter by certificate serial number
- `lotNumber` (string): Filter by lot number
- `typeOfOre` (string): Filter by mineral code
- `dateOfIssuanceFrom` (date): Filter from date
- `dateOfIssuanceTo` (date): Filter to date
- `page` (integer): Page number
- `limit` (integer): Results per page

##### Get Export Certificate

```http
GET /export-certificates/{identifier}?issuingCountry={country}
```

**Path Parameters:**
- `identifier` (string): Certificate serial number

**Query Parameters:**
- `issuingCountry` (string, required): Issuing country code

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
- `mineSiteId` (string): Filter by mine site ICGLR ID
- `mineral` (string): Filter by mineral code
- `creatorRole` (integer): Filter by CoC role code (1-8)
- `originatingOperation` (integer): Filter by operation code (1-8)
- `lotNumber` (string): Filter by lot number
- `dateRegistrationFrom` (date): Filter from dateRegistration
- `dateRegistrationTo` (date): Filter to dateRegistration
- `page` (integer): Page number
- `limit` (integer): Results per page

##### Get Lot

```http
GET /lots/{lotNumber}
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
    "field": "fieldName",
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
  mineId: "M001",
  mineName: "Kivu Mine",
  country: "RW",
  location: { lat: -1.94, lng: 29.87 },
  status: "Certified"
}

// ICGLR format
{
  icglrId: "RW-1.9400+30.8700-00001",
  addressCountry: "RW",
  nationalId: "M001",
  certificationStatus: 1,  // 1 = Green (Certified)
  activityStatus: 1,        // 1 = Active
  mineSiteLocation: {
    geolocalization: {
      latitude: -1.94,
      longitude: 30.87
    },
    nationalCadasterLocalization: "...",
    localGeographicDesignation: {
      country: "RW",
      subnationalDivisionL1: "RW-02",
      addressLocalityText: "Muhanga"
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
  if (!icglrIdPattern.test(req.body.icglrId)) {
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
- Mine Sites MUST use `icglrId` with format `CC-[Lat]-[Long]-NNNNN`
- All identifiers MUST be unique
- Field names MUST use camelCase convention

**Geographic Data:**
- All location data MUST include `geolocalization` with `latitude` and `longitude`
- Latitude MUST be between -90 and 90
- Longitude MUST be between -180 and 180
- Coordinates MUST use decimal degrees (WGS84) with 4 decimal places
- Address MUST use ISO 3166-2 format for subnational divisions

**Date and Time Formats:**
- All dates MUST use ISO 8601 format (YYYY-MM-DD)
- All date-times MUST use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) when a date-time is used
- Time (primitive) MUST use hhmmss (e.g., `103000`)
- Time zones MUST be specified (preferably UTC) when using date-times

**ICGLR Member State Codes:**
- Country codes MUST use ISO 3166-1 alpha-2 format
- Only ICGLR member state codes allowed: AO, BI, CD, CF, CG, KE, RW, SS, SD, TZ, UG, ZM

**Naming Convention:**
- All technical field names MUST use camelCase convention
- Examples: `icglrId`, `certificationStatus`, `mineSiteLocation`
- NO snake_case or PascalCase in field names

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
- Mine Sites: `GET /mine-sites`, `GET /mine-sites/{icglrId}`, `POST /mine-sites`, `PUT /mine-sites/{icglrId}`
- Export Certificates: `GET /export-certificates`, `GET /export-certificates/{identifier}`, `POST /export-certificates`
- Lots: `GET /lots`, `GET /lots/{lotNumber}`, `POST /lots`

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
**Technical Term**: `icglrId`  
**Cardinality**: 1..1 (Required, only once)

#### camelCase Naming

All field names use camelCase:
- ✅ `icglrId`
- ✅ `certificationStatus`
- ✅ `mineSiteLocation`
- ✅ `dateOfIssuance`
- ❌ `icglr_id` (snake_case)
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
- Recursive `inputLot` references for transformations
- Conditional requirements (e.g., `mineSiteId` and `tag` required for Production)
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


# ICGLR Conformance Validators

This directory contains validation tools and schemas for ensuring API conformance with the ICGLR Mining Sector Data Sharing Protocol Standards.

## Schema Validator

The `schema-validator.js` tool validates JSON data against ICGLR JSON schemas.

### Installation

```bash
npm install ajv ajv-formats
```

### Usage

#### Command Line

```bash
node schema-validator.js <schema-name> <json-file>
```

Example:
```bash
node schema-validator.js mine-site examples/json/mine-site-example.json
```

#### Programmatic Usage

```javascript
const validator = require('./schema-validator');

const data = {
  icglr_id: "RW-1.9641+30.0619-00001",
  address_country: "RW",
  certification_status: 1,
  // ... other fields
};

const result = validator.validate(data, 'mine-site');

if (result.valid) {
  console.log('Valid!');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Available Schemas

- `common` - Common data structures (Address, BusinessEntity, Code Lists)
- `mine-site` - Mine site data (MD.01)
- `license` - Mining license (MD.02)
- `export-certificate` - Export certificate (MD.03)
- `lot` - Chain of Custody lot (MD.12)
- `tag` - Lot tag (MD.11)
- `tax` - Tax payment (MD.13)

### Validation Rules

The validator checks:
- Required fields presence
- Data types (snake_case field names)
- ICGLR ID format: `CC-[Lat]-[Long]-NNNNN`
- Status codes (integers: 0, 1, 2, 3)
- Mineral codes (HS Codes or IMA Codes)
- Date formats (ISO 8601)
- Geographic coordinates (WGS84, 4 decimals)
- Address format (ISO 3166-2 for subdivisions)

## API Conformance Validator

The API conformance validator checks if an API implementation meets the conformance rules.

### Features

- Validates OpenAPI endpoint implementation
- Checks response formats (snake_case)
- Verifies error handling
- Tests pagination
- Validates filtering (status codes, mineral codes)
- Checks authentication/authorization
- Validates ICGLR ID format
- Verifies status code integers

### Usage

```bash
node api-validator.js <api-base-url>
```

## Test Suites

See `../test-suites/` for comprehensive conformance test cases.

## Contributing

When adding new validators:
1. Follow the existing pattern
2. Include error messages with field paths
3. Support both CLI and programmatic usage
4. Add tests for the validator
5. Validate snake_case naming
6. Validate integer status codes
7. Validate ICGLR ID format

# ICGLR Conformance Test Suites

This directory contains test suites for validating API conformance with the ICGLR Mining Sector Data Sharing Protocol Standards.

## Test Structure

Tests are organized by conformance level and feature:

- `level1/` - Basic conformance tests (REQUIRED)
- `level2/` - API endpoint conformance tests (REQUIRED)
- `level3/` - JSON-LD support tests (RECOMMENDED)
- `level4/` - GraphQL support tests (OPTIONAL)

## Running Tests

### Prerequisites

```bash
npm install
# or
pip install -r requirements.txt
```

### Run All Tests

```bash
npm test
# or
pytest test_suites/
```

### Run Specific Test Suite

```bash
npm test -- --grep "Level 1"
# or
pytest test_suites/level1/
```

## Test Categories

### Schema Validation Tests

Tests that data structures conform to JSON schemas:
- Required fields present
- Data types correct
- Enum values valid
- Format validation (dates, emails, etc.)
- **camelCase field names**
- **ICGLR ID format validation**
- **Status code integers (not strings)**

### API Endpoint Tests

Tests that API endpoints work as specified:
- Endpoints exist and respond
- Request/response formats match OpenAPI spec
- Status codes correct
- Error handling proper
- **Mine Sites endpoints** (`/mine-sites`)
- **Export Certificates endpoints** (`/export-certificates`)
- **Lots endpoints** (`/lots`)

### Data Integrity Tests

Tests for data consistency:
- Identifier uniqueness
- Referential integrity
- Date/time consistency
- Geographic coordinate validity
- **ICGLR ID format**: `CC-[Lat]-[Long]-NNNNN`
- **Status code validation**: integers 0, 1, 2, 3
- **Mineral code validation**: HS Codes or IMA Codes

### Chain of Custody Tests

Tests for Chain of Custody functionality:
- Lot creation and transformation
- Input lot references (recursive)
- Conditional requirements (mineSiteId and tag for Production)
- CoC role validation
- Originating operation validation
- Tax payment tracking

### Performance Tests

Tests for performance requirements:
- Response time limits
- Pagination efficiency
- Large dataset handling

## Writing Tests

When writing new tests:

1. Use descriptive test names
2. Include setup and teardown
3. Test both success and failure cases
4. Include edge cases
5. Document test requirements
6. **Test camelCase field names**
7. **Test integer status codes**
8. **Test ICGLR ID format**
9. **Test mineral codes (HS/IMA)**

## Test Data

Test data files are in `../examples/json/`. Tests should use:
- `mine-site-example.json`
- `export-certificate-example.json`
- `lot-example.json`

Tests should use this data or generate valid test data following the semantic model.

## Continuous Integration

These tests should be run:
- On every commit
- Before releases
- As part of API certification

## Key Test Scenarios

### Mine Site Tests
- ICGLR ID format validation
- Certification status (0, 1, 2, 3)
- Activity status (0, 1, 2)
- Mineral code validation
- Address with ISO 3166-2 subdivisions

### Export Certificate Tests
- Exporter/Importer BusinessEntity
- Mineral origin format (country codes separated by space)
- Date validation (issuance, expiration, verification)

### Lot Tests
- Chain of Custody operations
- Input lot references
- Conditional requirements
- CoC role codes (1-8)
- Originating operation codes (1-8)

# JSON Examples

This directory contains JSON examples for the ICGLR Mining Sector Data Sharing Protocol Standards, based on the semantic model defined in `DOCUMENTATION.txt`.

## Current Examples

### Primary Entities

#### Mine Site (MD.01)
- **`mine-site-example.json`** - Complete mine site example with:
  - ICGLR ID format: `RW-1.9641+30.0619-00001`
  - Certification status: 1 (Green/Certified)
  - Activity status: 1 (Active)
  - License information
  - Owner and operator BusinessEntity
  - Inspection records
  - Status history

#### Export Certificate (MD.03)
- **`export-certificate-example.json`** - ICGLR export certificate with:
  - Exporter and importer BusinessEntity
  - Lot information
  - Mineral details (Cassiterite - IMA1960-001)
  - Verification and validation details
  - Certificate file reference

#### Lot - Chain of Custody (MD.12)
- **`lot-example.json`** - Chain of Custody lot record with:
  - Production operation (originating_operation: [1])
  - Mine site reference
  - Tag information
  - Tax payments
  - Creator and recipient BusinessEntity

## Example Usage

### Validate Examples

```bash
# Validate mine site example
node conformance/validators/schema-validator.js mine-site examples/json/mine-site-example.json

# Validate export certificate example
node conformance/validators/schema-validator.js export-certificate examples/json/export-certificate-example.json

# Validate lot example
node conformance/validators/schema-validator.js lot examples/json/lot-example.json
```

Or use npm scripts:

```bash
npm run validate:mine-site
npm run validate:export-certificate
npm run validate:lot
```

## Key Features Demonstrated

### 1. ICGLR ID Format
Mine sites use the standardized format:
```
CC-[Lat]-[Long]-NNNNN
```
Example: `RW-1.9641+30.0619-00001`

### 2. snake_case Naming
All field names use snake_case:
- `icglr_id`
- `certification_status`
- `mine_site_location`
- `date_of_issuance`

### 3. Integer Status Codes
Status values use integers for language independence:
- Certification Status: `0` (Blue), `1` (Green), `2` (Yellow), `3` (Red)
- Activity Status: `0` (Abandoned), `1` (Active), `2` (Non-active)
- CoC Roles: `1` (Miner), `2` (Trader), `3` (Shipper), etc.
- Originating Operations: `1` (Production), `2` (Purchase), etc.

### 4. Mineral Codes
Minerals use HS Codes or IMA Codes:
- `IMA1960-A` - Gold
- `IMA1960-001` - Cassiterite
- `IMA2000-014` - Wolframite
- `IMA1979-A` - Coltan

### 5. ISO 3166-2 Addresses
Addresses use ISO 3166-2 for subnational divisions:
- `RW-01` - Kigali City, Rwanda
- `RW-02` - Southern Province, Rwanda
- `CD-BU` - Bas-Uélé, DRC

### 6. Chain of Custody
Lot examples demonstrate:
- Production operations
- Tag assignment
- Tax payment tracking
- Business entity relationships
- Recursive input_lot references (for lot transformations)

## Creating New Examples

When creating new examples:

1. **Follow the semantic model**: Use entities and attributes as defined in `DOCUMENTATION.txt`
2. **Use snake_case**: All field names must use snake_case
3. **Validate**: Always validate examples using the schema validator
4. **Use correct formats**:
   - ICGLR ID: `CC-[Lat]-[Long]-NNNNN`
   - Dates: ISO 8601 (YYYY-MM-DD)
   - Status codes: Integers (0, 1, 2, 3)
   - Mineral codes: HS Codes or IMA Codes
5. **Include required fields**: Check JSON schemas for required fields
6. **Test**: Validate against the appropriate schema before committing

## Notes

- Examples use realistic but fictional data
- All examples have been validated against their respective JSON schemas
- Examples demonstrate best practices for data structure
- BusinessEntity addresses can use any ISO 3166-1 alpha-2 country code (not limited to ICGLR member states, e.g., for importers)


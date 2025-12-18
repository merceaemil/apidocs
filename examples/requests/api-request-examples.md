# API Request Examples

This document provides example API requests for the ICGLR Mining Sector Data Sharing Protocol based on the semantic model.

## Authentication

All requests require authentication. Include the Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Or use API key:

```http
X-API-Key: <your-api-key>
```

## Mine Sites (MD.01)

### List Mine Sites

```http
GET /v1/mine-sites?address_country=RW&certification_status=1&activity_status=1&page=1&limit=20
Accept: application/json
```

Response:
```json
{
  "data": [
    {
      "icglr_id": "RW-1.9641+30.0619-00001",
      "address_country": "RW",
      "national_id": "RW-MINE-2024-001",
      "certification_status": 1,
      "activity_status": 1,
      "mine_site_location": {
        "geolocalization": {
          "latitude": -1.9641,
          "longitude": 30.0619
        },
        "national_cadaster_localization": "Rwanda Mining Cadaster - Sector 12",
        "local_geographic_designation": {
          "country": "RW",
          "subnational_division_l1": "RW-02",
          "address_locality": "Muhanga"
        }
      },
      "mineral": ["IMA1960-001", "IMA2000-014"],
      "license": [...],
      "owner": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Get Mine Site by ICGLR ID

```http
GET /v1/mine-sites/RW-1.9641+30.0619-00001
Accept: application/json
```

### Create Mine Site

```http
POST /v1/mine-sites
Content-Type: application/json

{
  "icglr_id": "RW-1.9641+30.0619-00001",
  "address_country": "RW",
  "national_id": "RW-MINE-2024-001",
  "certification_status": 1,
  "activity_status": 1,
  "mine_site_location": {
    "geolocalization": {
      "latitude": -1.9641,
      "longitude": 30.0619
    },
    "national_cadaster_localization": "Rwanda Mining Cadaster - Sector 12",
    "local_geographic_designation": {
      "country": "RW",
      "subnational_division_l1": "RW-02",
      "subnational_division_l1_text": "Southern Province",
      "address_locality": "Muhanga"
    }
  },
  "mineral": ["IMA1960-001"],
  "license": [
    {
      "license_type": "mining_license",
      "license_id": "RW-ML-2024-001",
      "owner": {
        "identifier": "COMP-RW-001",
        "name": "Rwanda Mining Corporation Ltd",
        "legal_address": {
          "country": "RW",
          "subnational_division_l1": "RW-01",
          "address_locality": "Kigali"
        },
        "physical_address": {
          "country": "RW",
          "subnational_division_l1": "RW-01",
          "address_locality": "Kigali"
        },
        "tin": "123456789",
        "rdb_number": "RDB-2024-001",
        "rca_number": "RCA-2024-001",
        "contact_details": {
          "legal_representative": "John Doe",
          "contact_phone_number": "+250-788-123-456",
          "contact_email": "contact@rwandamining.rw"
        }
      },
      "covered_commodities": ["IMA1960-001"]
    }
  ],
  "owner": {
    "identifier": "COMP-RW-001",
    "name": "Rwanda Mining Corporation Ltd",
    "legal_address": {
      "country": "RW",
      "subnational_division_l1": "RW-01",
      "address_locality": "Kigali"
    },
    "physical_address": {
      "country": "RW",
      "subnational_division_l1": "RW-01",
      "address_locality": "Kigali"
    },
    "tin": "123456789",
    "rdb_number": "RDB-2024-001",
    "rca_number": "RCA-2024-001",
    "contact_details": {
      "legal_representative": "John Doe",
      "contact_phone_number": "+250-788-123-456",
      "contact_email": "contact@rwandamining.rw"
    }
  }
}
```

### Update Mine Site

```http
PUT /v1/mine-sites/RW-1.9641+30.0619-00001
Content-Type: application/json

{
  "certification_status": 2,
  "status_history": [
    {
      "date_of_change": "2024-04-15",
      "new_status": 2
    }
  ]
}
```

## Export Certificates (MD.03)

### List Export Certificates

```http
GET /v1/export-certificates?issuing_country=RW&type_of_ore=IMA1960-001&date_of_issuance_from=2024-01-01&date_of_issuance_to=2024-12-31
Accept: application/json
```

### Get Export Certificate

```http
GET /v1/export-certificates/RW-EXP-2024-001?issuing_country=RW
Accept: application/json
```

### Create Export Certificate

```http
POST /v1/export-certificates
Content-Type: application/json

{
  "issuing_country": "RW",
  "identifier": "RW-EXP-2024-001",
  "exporter": {
    "identifier": "COMP-RW-001",
    "name": "Rwanda Mining Corporation Ltd",
    "legal_address": {
      "country": "RW",
      "subnational_division_l1": "RW-01",
      "address_locality": "Kigali"
    },
    "physical_address": {
      "country": "RW",
      "subnational_division_l1": "RW-01",
      "address_locality": "Kigali"
    },
    "tin": "123456789",
    "rdb_number": "RDB-2024-001",
    "rca_number": "RCA-2024-001",
    "contact_details": {
      "legal_representative": "John Doe",
      "contact_phone_number": "+250-788-123-456",
      "contact_email": "contact@rwandamining.rw"
    }
  },
  "importer": {
    "identifier": "COMP-BE-001",
    "name": "Belgium Trading Company",
    "legal_address": {
      "country": "BE",
      "subnational_division_l1": "BE-BRU",
      "address_locality": "Brussels"
    },
    "physical_address": {
      "country": "BE",
      "subnational_division_l1": "BE-BRU",
      "address_locality": "Brussels"
    },
    "tin": "BE123456789",
    "rdb_number": "BE-RDB-001",
    "rca_number": "BE-RCA-001",
    "contact_details": {
      "legal_representative": "Jane Smith",
      "contact_phone_number": "+32-2-123-4567",
      "contact_email": "contact@belgiumtrading.be"
    }
  },
  "lot_number": "LOT-RW-2024-001",
  "designated_mineral_description": "Cassiterite concentrate, 1000kg, 45% Sn",
  "type_of_ore": "IMA1960-001",
  "lot_weight": 1000.0,
  "lot_weight_uom": "KGM",
  "lot_grade": "45%",
  "mineral_origin": "RW",
  "customs_value": "USD 85000.00",
  "date_of_shipment": "2024-04-15",
  "member_state_issuing_authority": "Ministry of Trade and Industry, Rwanda",
  "name_of_verifier": "Peter Smith",
  "position_of_verifier": "Senior Mining Inspector",
  "date_of_verification": "2024-04-10",
  "name_of_validator": "Mary Johnson",
  "date_of_issuance": "2024-04-12",
  "date_of_expiration": "2024-07-11",
  "certificate_file": "https://certificates.icglr.org/RW/RW-EXP-2024-001.pdf"
}
```

## Chain of Custody - Lots (MD.12)

### List Lots

```http
GET /v1/lots?mine_site_id=RW-1.9641+30.0619-00001&mineral=IMA1960-001&creator_role=1&originating_operation=1
Accept: application/json
```

### Get Lot by Lot Number

```http
GET /v1/lots/LOT-RW-2024-001
Accept: application/json
```

### Create Lot

```http
POST /v1/lots
Content-Type: application/json

{
  "lot_number": "LOT-RW-2024-001",
  "timestamp": "2024-03-20T10:30:00Z",
  "creator": {
    "identifier": "COMP-RW-001",
    "name": "Rwanda Mining Corporation Ltd",
    "legal_address": {
      "country": "RW",
      "subnational_division_l1": "RW-01",
      "address_locality": "Kigali"
    },
    "physical_address": {
      "country": "RW",
      "subnational_division_l1": "RW-01",
      "address_locality": "Kigali"
    },
    "tin": "123456789",
    "rdb_number": "RDB-2024-001",
    "rca_number": "RCA-2024-001",
    "contact_details": {
      "legal_representative": "John Doe",
      "contact_phone_number": "+250-788-123-456",
      "contact_email": "contact@rwandamining.rw"
    }
  },
  "mineral": "IMA1960-001",
  "concentration": 45.5,
  "mass": 1000.0,
  "unit_of_measurement": "KGM",
  "mine_site_id": "RW-1.9641+30.0619-00001",
  "creator_role": [1],
  "originating_operation": [1],
  "tag": {
    "identifier": "TAG-RW-2024-001",
    "issuer": {
      "identifier": "GOV-RW-001",
      "name": "Ministry of Mines, Rwanda",
      "legal_address": {
        "country": "RW",
        "subnational_division_l1": "RW-01",
        "address_locality": "Kigali"
      },
      "physical_address": {
        "country": "RW",
        "subnational_division_l1": "RW-01",
        "address_locality": "Kigali"
      },
      "tin": "GOV-001",
      "rdb_number": "GOV-RDB-001",
      "rca_number": "GOV-RCA-001",
      "contact_details": {
        "legal_representative": "Government Representative",
        "contact_phone_number": "+250-788-000-000",
        "contact_email": "mines@gov.rw"
      }
    },
    "issue_date": "2024-03-20",
    "issue_time": "10:30:00"
  },
  "tax_paid": [
    {
      "tax_type": "Mining Royalty",
      "tax_amount": 5000.00,
      "currency": "USD"
    }
  ],
  "date_sealed": "2024-03-20",
  "date_shipped": "2024-03-22"
}
```

## GraphQL Queries

### Query Mine Sites

```http
POST /v1/graphql
Content-Type: application/json

{
  "query": "query { mineSites(addressCountry: RW, certificationStatus: GREEN) { data { icglrId addressCountry certificationStatus mineral } pagination { total } } }"
}
```

### Query Export Certificates

```http
POST /v1/graphql
Content-Type: application/json

{
  "query": "query { exportCertificates(issuingCountry: RW, typeOfOre: \"IMA1960-001\") { data { identifier lotNumber typeOfOre lotWeight customsValue dateOfIssuance } pagination { total } } }"
}
```

### Query Lots with Chain of Custody

```http
POST /v1/graphql
Content-Type: application/json

{
  "query": "query { lots(mineSiteId: \"RW-1.9641+30.0619-00001\", originatingOperation: PRODUCTION) { data { lotNumber timestamp mineral mass creator { name } tag { identifier issueDate } } pagination { total } } }"
}
```

### Query Lot Summary

```http
POST /v1/graphql
Content-Type: application/json

{
  "query": "query { lotSummary(mineSiteId: \"RW-1.9641+30.0619-00001\", timestampFrom: \"2024-01-01T00:00:00Z\", timestampTo: \"2024-12-31T23:59:59Z\") { totalMass totalTaxPaid byMineral { mineral totalMass } } }"
}
```

## JSON-LD Requests

To get JSON-LD formatted responses, use the `Accept` header:

```http
GET /v1/mine-sites/RW-1.9641+30.0619-00001
Accept: application/ld+json
```

Response will include `@context` and use JSON-LD structure with semantic annotations.

## Filtering Parameters

### Certification Status Codes
- `0` = Blue (Uninspected or Out of RCM scope)
- `1` = Green (Certified)
- `2` = Yellow (Yellow-Flagged)
- `3` = Red (Un-Certified)

### Activity Status Codes
- `0` = Abandoned
- `1` = Active
- `2` = Non-active

### CoC Role Codes
- `1` = Miner
- `2` = Trader (in-country)
- `3` = Shipper
- `4` = Processor
- `5` = Warehouse
- `6` = Importer
- `7` = Exporter
- `8` = Government

### Originating Operation Codes
- `1` = Production
- `2` = Purchase
- `3` = Combination
- `4` = Processing
- `5` = Transportation
- `6` = Storage/Warehousing
- `7` = Import
- `8` = Export

## Error Responses

### Validation Error (400)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "field": "icglr_id",
    "reason": "Invalid format. Expected: CC-[Lat]-[Long]-NNNNN"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Not Found (404)

```json
{
  "code": "NOT_FOUND",
  "message": "Resource not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Server Error (500)

```json
{
  "code": "INTERNAL_ERROR",
  "message": "An internal error occurred",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Notes

- All field names use **snake_case** convention
- Mine Site IDs follow format: `CC-[Lat]-[Long]-NNNNN` (e.g., `RW-1.9641+30.0619-00001`)
- Mineral codes use HS Codes or IMA Codes (e.g., `IMA1960-001` for Cassiterite)
- Status values are integers, not text (language-independent)
- Dates use ISO 8601 format (YYYY-MM-DD)
- Date-times use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)

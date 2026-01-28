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
GET /v1/mine-sites?addressCountry=RW&certificationStatus=1&activityStatus=1&page=1&limit=20
Accept: application/json
```

Response:
```json
{
  "data": [
    {
      "icglrId": "RW-1.9641+30.0619-00001",
      "addressCountry": "RW",
      "nationalId": "RW-MINE-2024-001",
      "certificationStatus": 1,
      "activityStatus": 1,
      "mineSiteLocation": {
        "geolocalization": {
          "latitude": -1.9641,
          "longitude": 30.0619
        },
        "nationalCadasterLocalization": "Rwanda Mining Cadaster - Sector 12",
        "localGeographicDesignation": {
          "country": "RW",
          "subnationalDivisionL1": "RW-02",
          "addressLocalityText": "Muhanga"
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
  "icglrId": "RW-1.9641+30.0619-00001",
  "addressCountry": "RW",
  "nationalId": "RW-MINE-2024-001",
  "certificationStatus": 1,
  "activityStatus": 1,
  "mineSiteLocation": {
    "geolocalization": {
      "latitude": -1.9641,
      "longitude": 30.0619
    },
    "nationalCadasterLocalization": "Rwanda Mining Cadaster - Sector 12",
    "localGeographicDesignation": {
      "country": "RW",
      "subnationalDivisionL1": "RW-02",
      "subnationalDivisionL1Text": "Southern Province",
      "addressLocalityText": "Muhanga"
    }
  },
  "mineral": ["IMA1960-001"],
  "license": [
    {
      "licenseType": "mining_license",
      "licenseId": "RW-ML-2024-001",
      "owner": {
        "identifier": "COMP-RW-001",
        "name": "Rwanda Mining Corporation Ltd",
        "legalAddress": {
          "country": "RW",
          "subnationalDivisionL1": "RW-01",
          "addressLocalityText": "Kigali"
        },
        "physicalAddress": {
          "country": "RW",
          "subnationalDivisionL1": "RW-01",
          "addressLocalityText": "Kigali"
        },
        "tin": "123456789",
        "contactDetails": {
          "legalRepresentative": "John Doe",
          "contactPhoneNumber": "+250788123456",
          "contactEmail": "contact@rwandamining.rw"
        }
      },
      "coveredCommodities": ["IMA1960-001"]
    }
  ],
  "owner": {
    "identifier": "COMP-RW-001",
    "name": "Rwanda Mining Corporation Ltd",
    "legalAddress": {
      "country": "RW",
      "subnationalDivisionL1": "RW-01",
      "addressLocalityText": "Kigali"
    },
    "physicalAddress": {
      "country": "RW",
      "subnationalDivisionL1": "RW-01",
      "addressLocalityText": "Kigali"
    },
    "tin": "123456789",
    "contactDetails": {
      "legalRepresentative": "John Doe",
      "contactPhoneNumber": "+250788123456",
      "contactEmail": "contact@rwandamining.rw"
    }
  }
}
```

### Update Mine Site

```http
PUT /v1/mine-sites/RW-1.9641+30.0619-00001
Content-Type: application/json

{
  "certificationStatus": 2,
  "statusChange": [
    {
      "dateOfChange": "2024-04-15",
      "newStatus": 2
    }
  ]
}
```

## Export Certificates (MD.03)

### List Export Certificates

```http
GET /v1/export-certificates?issuingCountry=RW&typeOfOre=2609.00.00&dateOfIssuanceFrom=2024-01-01&dateOfIssuanceTo=2024-12-31
Accept: application/json
```

### Get Export Certificate

```http
GET /v1/export-certificates/RW-EXP-2024-001?issuingCountry=RW
Accept: application/json
```

### Create Export Certificate

```http
POST /v1/export-certificates
Content-Type: application/json

{
  "issuingCountry": "RW",
  "identifier": "RW-EXP-2024-001",
  "exporter": {
    "identifier": "COMP-RW-001",
    "name": "Rwanda Mining Corporation Ltd",
    "legalAddress": {
      "country": "RW",
      "subnationalDivisionL1": "RW-01",
      "addressLocalityText": "Kigali"
    },
    "physicalAddress": {
      "country": "RW",
      "subnationalDivisionL1": "RW-01",
      "addressLocalityText": "Kigali"
    },
    "tin": "123456789",
    "contactDetails": {
      "legalRepresentative": "John Doe",
      "contactPhoneNumber": "+250788123456",
      "contactEmail": "contact@rwandamining.rw"
    }
  },
  "importer": {
    "identifier": "COMP-BE-001",
    "name": "Belgium Trading Company",
    "legalAddress": {
      "country": "BE",
      "subnationalDivisionL1": "BE-BRU",
      "addressLocalityText": "Brussels"
    },
    "physicalAddress": {
      "country": "BE",
      "subnationalDivisionL1": "BE-BRU",
      "addressLocalityText": "Brussels"
    },
    "tin": "BE123456789",
    "contactDetails": {
      "legalRepresentative": "Jane Smith",
      "contactPhoneNumber": "+3221234567",
      "contactEmail": "contact@belgiumtrading.be"
    }
  },
  "lotNumber": "LOT-RW-2024-001",
  "designatedMineralDescription": "Cassiterite concentrate, 1000kg, 45% Sn",
  "typeOfOre": "IMA1960-001",
  "lotWeight": 1000.0,
  "lotWeightUOM": "KGM",
  "lotGrade": "45%",
  "mineralOrigin": "RW",
  "customsValue": "USD 85000.00",
  "dateOfShipment": "2024-04-15",
  "memberStateIssuingAuthority": "Ministry of Trade and Industry, Rwanda",
  "nameOfVerifier": "Peter Smith",
  "positionOfVerifier": "Senior Mining Inspector",
  "dateOfVerification": "2024-04-10",
  "nameOfValidator": "Mary Johnson",
  "dateOfIssuance": "2024-04-12",
  "dateOfExpiration": "2024-07-11",
  "certificateFile": "https://certificates.icglr.org/RW/RW-EXP-2024-001.pdf"
}
```

## Chain of Custody - Lots (MD.12)

### List Lots

```http
GET /v1/lots?mineSiteId=RW-1.9641+30.0619-00001&mineral=2609.00.00&creatorRole=1&originatingOperation=1&dateRegistrationFrom=2024-01-01&dateRegistrationTo=2024-12-31
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
  "lotNumber": "LOT-RW-2024-001",
  "dateRegistration": "2024-03-20",
  "timeRegistration": "103000",
  "creator": {
    "identifier": "COMP-RW-001",
    "name": "Rwanda Mining Corporation Ltd",
    "legalAddress": {
      "country": "RW",
      "subnationalDivisionL1": "RW-01",
      "addressLocalityText": "Kigali"
    },
    "physicalAddress": {
      "country": "RW",
      "subnationalDivisionL1": "RW-01",
      "addressLocalityText": "Kigali"
    },
    "tin": "123456789",
    "contactDetails": {
      "legalRepresentative": "John Doe",
      "contactPhoneNumber": "+250788123456",
      "contactEmail": "contact@rwandamining.rw"
    }
  },
  "mineral": "IMA1960-001",
  "concentration": 45.5,
  "mass": 1000.0,
  "unitOfMeasurement": "KGM",
  "mineSiteId": "RW-1.9641+30.0619-00001",
  "creatorRole": [1],
  "originatingOperation": [1],
  "tag": {
    "identifier": "TAG-RW-2024-001",
    "issuer": {
      "identifier": "GOV-RW-001",
      "name": "Ministry of Mines, Rwanda",
      "legalAddress": {
        "country": "RW",
        "subnationalDivisionL1": "RW-01",
        "addressLocalityText": "Kigali"
      },
      "physicalAddress": {
        "country": "RW",
        "subnationalDivisionL1": "RW-01",
        "addressLocalityText": "Kigali"
      },
      "tin": "GOV-001",
      "contactDetails": {
        "legalRepresentative": "Government Representative",
        "contactPhoneNumber": "+250788000000",
        "contactEmail": "mines@gov.rw"
      }
    },
    "issueDate": "2024-03-20",
    "issueTime": "103000"
  },
  "taxPaid": [
    {
      "taxType": "Mining Royalty",
      "taxAmount": 5000.00,
      "currency": "USD"
    }
  ],
  "dateSealed": "2024-03-20",
  "dateShipped": "2024-03-22"
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
    "field": "icglrId",
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

- All technical field names use **camelCase** convention
- Mine Site IDs follow format: `CC-[Lat]-[Long]-NNNNN` (e.g., `RW-1.9641+30.0619-00001`)
- Mineral codes use HS Codes or IMA Codes (e.g., `IMA1960-001` for Cassiterite)
- Status values are integers, not text (language-independent)
- Dates use ISO 8601 format (YYYY-MM-DD)
- Date-times use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)

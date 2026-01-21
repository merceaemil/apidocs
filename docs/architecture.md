# ICGLR Mining Sector Data Sharing Protocol - Architecture

## Overview

The ICGLR Mining Sector Data Sharing Protocol provides a standardized approach for exchanging mining sector data between ICGLR member states. This document describes the architecture and design principles.

## Design Principles

### 1. Data Exchange Focus

**Important**: The standard is designed for **data exchange**, not as a relational database schema. While implementers may structure storage similarly, the standard focuses on interoperability.

### 2. Semantic Interoperability

- JSON-LD provides semantic meaning
- Linked data principles enable data integration
- Vocabulary reuse from established standards (Schema.org, Dublin Core)

### 3. Technical Flexibility

- GraphQL enables querying non-standard APIs
- JSON schemas provide validation without dictating storage
- RESTful APIs for standard operations

### 4. Progressive Enhancement

- Level 1: Basic conformance (required)
- Level 2: API endpoints (required)
- Level 3: JSON-LD support (recommended)
- Level 4: GraphQL support (optional)

## Architecture Layers

### 1. Semantic Layer

**Purpose**: Define meaning and relationships

**Components**:
- JSON-LD context (`json-ld/context.jsonld`)
- Vocabulary definitions (`json-ld/vocab/`)
- Linked data principles

**Benefits**:
- Machine-readable semantics
- Integration with other standards
- Future-proof data structures

### 2. Schema Layer

**Purpose**: Define data structure and validation

**Components**:
- JSON schemas (`schemas/`)
- Common definitions (`schemas/core/`)
- Domain-specific schemas

**Benefits**:
- Data validation
- Type safety
- Documentation

### 3. API Layer

**Purpose**: Define data exchange interfaces

**Components**:
- OpenAPI specification (`api/openapi.yaml`)
- RESTful endpoints
- GraphQL schema (`graphql/schema.graphql`)

**Benefits**:
- Standardized interfaces
- Tooling support (Swagger UI, code generation)
- Multiple access patterns

### 4. Conformance Layer

**Purpose**: Ensure interoperability

**Components**:
- Conformance rules (`conformance/rules.md`)
- Validators (`conformance/validators/`)
- Test suites (`conformance/test-suites/`)

**Benefits**:
- Quality assurance
- Certification support
- Interoperability guarantees

## Semantic Model Structure

The architecture is based on the ICGLR Data Sharing Protocol Standards semantic model:

### Primary Entities
- **Mine Site (MD.01)**: Core mining site information with ICGLR ID format
- **Export Certificate (MD.03)**: ICGLR export certificates
- **Lot (MD.12)**: Chain of Custody tracking

### Secondary Entities
- **License (MD.02)**: Mining licenses
- **Business Entity (MD.04)**: Companies and organizations
- **Address (MD.05)**: Address with ISO 3166-2 subdivisions
- **Geolocalization (MD.06)**: WGS 84 coordinates
- **Inspection (MD.07)**: Mine site inspections
- **Mine Site Location (MD.08)**: Location details
- **Contact Details (MD.09)**: Contact information
- **Status History (MD.10)**: Certification status changes
- **Tag (MD.11)**: Lot tags
- **Tax (MD.13)**: Tax payment information

### Code Lists
- **MDC.01**: Certification Status (0=Blue, 1=Green, 2=Yellow, 3=Red)
- **MDC.02**: Mining Activity Status (0=Abandoned, 1=Active, 2=Non-active)
- **MDC.03**: Mineral (HS Codes and IMA Codes)
- **MDC.04**: License Type
- **MDC.05**: CoC Roles (1-8)
- **MDC.06**: Originating Operations (1-8)

## Data Flow

### Standard Data Exchange

```
[System A] --[JSON/JSON-LD]--> [ICGLR API] --[JSON/JSON-LD]--> [System B]
                |                                        |
                +--[Validation]--+                       |
                                 |                       |
                            [Schema Validator]           |
                                                         |
[System C] --[GraphQL]---------> [ICGLR API] <----------+
```

### Chain of Custody Flow

```
[Mine Site] --> [Lot (Production)] --> [Lot (Processing)] --> [Lot (Export)] --> [Export Certificate]
     |                |                       |                      |
     +--[Tag]---------+                       +--[Tax]--------------+
```

### GraphQL Federation

```
[Legacy System] --[Custom API]--+
                                 |
[ICGLR System] --[Standard API]--+--> [GraphQL Gateway] --> [Client]
                                 |
[Other System] --[Different API]-+
```

## Component Details

### JSON Schemas

**Location**: `schemas/`

**Structure**:
- `core/common.json` - Shared definitions (Address, BusinessEntity, Code Lists)
- `mine-site/` - Mine site schemas (MD.01, MD.02, MD.07, MD.08, MD.10)
- `export-certificate/` - Export certificate schemas (MD.03)
- `chain-of-custody/` - Chain of Custody schemas (MD.12, MD.11, MD.13)

**Usage**:
- Validation of incoming data
- Documentation
- Code generation

### OpenAPI Specification

**Location**: `api/openapi.yaml`

**Endpoints**:
- `/mine-sites` - Mine site management (MD.01)
- `/export-certificates` - Export certificate management (MD.03)
- `/lots` - Chain of Custody lot tracking (MD.12)
- `/graphql` - GraphQL query endpoint

**Features**:
- Complete API definition
- Request/response schemas with camelCase
- Authentication/authorization
- Error handling
- Filtering by status codes, mineral codes, etc.

**Usage**:
- API documentation (Swagger UI)
- Client code generation
- Server code generation
- Testing

### GraphQL Schema

**Location**: `graphql/schema.graphql`

**Features**:
- Flexible querying
- Type system
- Federation support
- Aggregations

**Usage**:
- Query non-standard APIs
- Combine multiple data sources
- Client-specific data shapes

### JSON-LD Context

**Location**: `json-ld/context.jsonld`

**Features**:
- Semantic annotations
- Vocabulary mapping
- Linked data support

**Usage**:
- Semantic web integration
- Data linking
- Knowledge graphs

## Implementation Patterns

### Pattern 1: Direct API Implementation

Implement the OpenAPI specification directly:

```
[Client] --> [Your API] --> [Your Database]
```

### Pattern 2: Adapter Pattern

Adapt existing systems to the standard:

```
[Client] --> [Adapter Layer] --> [Legacy System]
                |
                +--[Transforms to ICGLR format]
```

### Pattern 3: GraphQL Gateway

Use GraphQL to query multiple sources:

```
[Client] --> [GraphQL Gateway] --> [ICGLR API]
                                  [Legacy API]
                                  [Other API]
```

## Security Architecture

### Authentication

- JWT Bearer tokens
- API keys
- OAuth 2.0 (recommended)

### Authorization

- Role-based access control
- Resource-level permissions
- Audit logging

### Data Integrity

- Cryptographic signatures
- Hash verification for attachments
- Timestamp validation

## Scalability Considerations

### Stateless Design

- APIs are stateless
- Session state in tokens
- Horizontal scaling support

### Caching

- Response caching
- Schema caching
- Query result caching

### Performance

- Pagination for large datasets
- Filtering at database level
- Indexed queries

## Deployment Architecture

### Single Instance

```
[Load Balancer] --> [API Server] --> [Database]
```

### Microservices

```
[API Gateway] --> [Mining Ops Service] --> [Database]
                --> [Production Service] --> [Database]
                --> [Compliance Service] --> [Database]
```

### Serverless

```
[API Gateway] --> [Lambda Functions] --> [DynamoDB/S3]
```

## Integration Patterns

### ETL Integration

```
[Source System] --> [ETL] --> [ICGLR Format] --> [Target System]
```

### Real-time Integration

```
[Source System] --> [Message Queue] --> [ICGLR API] --> [Target System]
```

### Batch Integration

```
[Source System] --> [Batch Export] --> [ICGLR Format] --> [Batch Import] --> [Target System]
```

## Monitoring and Observability

### Metrics

- Request rates
- Response times
- Error rates
- Validation failures

### Logging

- Request/response logging
- Error logging
- Audit trails

### Tracing

- Request tracing
- Distributed tracing
- Performance profiling

## Future Considerations

### Versioning

- Semantic versioning
- Backward compatibility
- Migration paths

### Extensibility

- Custom fields
- Extension points
- Plugin architecture

### Internationalization

- Multi-language support
- Locale-specific formats
- Translation support

## References

- [JSON Schema](https://json-schema.org/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GraphQL](https://graphql.org/)
- [JSON-LD](https://json-ld.org/)
- [ICGLR Standards](https://icglr.org)


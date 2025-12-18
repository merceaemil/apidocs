# ICGLR Mining Sector Data Sharing Protocol - Implementation Guide

## Introduction

This guide helps implementers build APIs that conform to the ICGLR Mining Sector Data Sharing Protocol Standards.

## Quick Start

### 1. Review the Standard

- Read `README.md` for overview
- Review `conformance/rules.md` for requirements
- Examine `schemas/` for data structures
- Check `api/openapi.yaml` for API specification

### 2. Choose Your Implementation Approach

**Option A: Direct Implementation**
- Implement OpenAPI spec directly
- Best for new systems

**Option B: Adapter Pattern**
- Build adapter layer over existing system
- Best for legacy systems

**Option C: GraphQL Gateway**
- Use GraphQL to federate multiple sources
- Best for multiple data sources

### 3. Set Up Development Environment

```bash
# Clone or download the standard
git clone https://github.com/icglr/mining-data-sharing-protocol.git

# Install validation tools
cd conformance/validators
npm install

# Validate your data
node schema-validator.js mine-site your-data.json
```

## Implementation Steps

### Step 1: Data Model Mapping

Map your internal data model to ICGLR schemas:

1. Identify equivalent fields
2. Handle missing fields (make optional or provide defaults)
3. Transform data types if needed
4. Map enumerations

**Example Mapping**:

```javascript
// Your internal model
{
  mine_id: "M001",
  mine_name: "Kivu Mine",
  country: "RW",
  location: { lat: -1.94, lng: 29.87 },
  status: "Certified"
}

// ICGLR format (snake_case, ICGLR ID format, integer status codes)
{
  icglr_id: "RW-1.9400+30.8700-00001",
  address_country: "RW",
  national_id: "M001",
  certification_status: 1,  // 1 = Green (Certified)
  activity_status: 1,      // 1 = Active
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

### Step 2: Implement Endpoints

#### 2.1 Mine Sites Endpoints (MD.01)

**Required Endpoints**:
- `GET /mine-sites` - List with filtering
- `GET /mine-sites/{icglr_id}` - Get by ICGLR ID
- `POST /mine-sites` - Create
- `PUT /mine-sites/{icglr_id}` - Update

**Implementation Checklist**:
- [ ] Validate input against JSON schema
- [ ] Support filtering (address_country, certification_status, activity_status, mineral)
- [ ] Validate ICGLR ID format: `CC-[Lat]-[Long]-NNNNN`
- [ ] Implement pagination
- [ ] Return proper error codes
- [ ] Handle status_history updates

**Key Points**:
- Use snake_case for all field names
- Certification status: 0=Blue, 1=Green, 2=Yellow, 3=Red (integers, not text)
- Activity status: 0=Abandoned, 1=Active, 2=Non-active
- Mineral codes: Use HS Codes or IMA Codes (e.g., `IMA1960-001`)

#### 2.2 Export Certificates Endpoints (MD.03)

**Required Endpoints**:
- `GET /export-certificates` - List with filtering
- `GET /export-certificates/{identifier}` - Get by identifier (requires issuing_country)
- `POST /export-certificates` - Create

**Implementation Checklist**:
- [ ] Validate export certificate structure
- [ ] Support filtering (issuing_country, identifier, lot_number, type_of_ore, dates)
- [ ] Handle exporter and importer BusinessEntity
- [ ] Validate mineral origin format (country codes separated by space)
- [ ] Track verification and validation dates

#### 2.3 Chain of Custody - Lots Endpoints (MD.12)

**Required Endpoints**:
- `GET /lots` - List with filtering
- `GET /lots/{lot_number}` - Get by lot number
- `POST /lots` - Create

**Implementation Checklist**:
- [ ] Validate lot structure
- [ ] Support filtering (mine_site_id, mineral, creator_role, originating_operation)
- [ ] Handle input_lot references (recursive structure)
- [ ] Validate conditional requirements (e.g., mine_site_id and tag required for Production)
- [ ] Track tax_paid information
- [ ] Support all CoC operations (Production, Purchase, Combination, Processing, etc.)

**Key Points**:
- Creator role: 1=Miner, 2=Trader, 3=Shipper, 4=Processor, 5=Warehouse, 6=Importer, 7=Exporter, 8=Government
- Originating operation: 1=Production, 2=Purchase, 3=Combination, 4=Processing, etc.
- If originating_operation includes Production (1), mine_site_id and tag are REQUIRED

### Step 3: Validation

Implement validation at multiple levels:

#### 3.1 Input Validation

```javascript
const validator = require('./conformance/validators/schema-validator');

function createMineSite(req, res) {
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
      message: 'Invalid ICGLR ID format. Expected: CC-[Lat]-[Long]-NNNNN',
      details: { field: 'icglr_id' }
    });
  }
  
  // Process valid data...
}
```

#### 3.2 Business Logic Validation

- Check referential integrity
- Validate business rules
- Ensure data consistency

#### 3.3 Output Validation

Validate responses before sending:

```javascript
function getMineSite(req, res) {
  const mineSite = db.getMineSite(req.params.icglr_id);
  const result = validator.validate(mineSite, 'mine-site');
  
  if (!result.valid) {
    // Log error, fix data, or return error
  }
  
  res.json(mineSite);
}
```

### Step 4: Error Handling

Implement consistent error handling:

```javascript
// Error handler middleware
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
  
  // Log error
  console.error(err);
  
  // Return generic error
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
    timestamp: new Date().toISOString()
  });
}
```

### Step 5: Pagination

Implement consistent pagination:

```javascript
function listMineSites(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  
  // Convert query parameters to snake_case
  const filters = {
    address_country: req.query.address_country,
    certification_status: req.query.certification_status ? parseInt(req.query.certification_status) : undefined,
    activity_status: req.query.activity_status ? parseInt(req.query.activity_status) : undefined,
    mineral: req.query.mineral
  };
  
  const { data, total } = db.getMineSites({
    filters,
    limit,
    offset
  });
  
  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1
    }
  });
}
```

### Step 6: Filtering

Implement filtering as specified in OpenAPI:

```javascript
function applyFilters(query, filters) {
  if (filters.address_country) {
    query = query.where('address_country', filters.address_country);
  }
  
  if (filters.certification_status !== undefined) {
    query = query.where('certification_status', filters.certification_status);
  }
  
  if (filters.activity_status !== undefined) {
    query = query.where('activity_status', filters.activity_status);
  }
  
  if (filters.mineral) {
    query = query.where('mineral', 'ARRAY_CONTAINS', filters.mineral);
  }
  
  return query;
}
```

### Step 7: Authentication & Authorization

Implement security:

```javascript
// JWT authentication middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid token'
    });
  }
}

// Authorization middleware
function authorize(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }
    next();
  };
}
```

### Step 8: JSON-LD Support (Optional)

Add JSON-LD support:

```javascript
function getMineSite(req, res) {
  const mineSite = db.getMineSite(req.params.icglr_id);
  
  // Check if client wants JSON-LD
  if (req.headers.accept?.includes('application/ld+json')) {
    mineSite['@context'] = 'https://icglr.org/json-ld/context.jsonld';
    mineSite['@type'] = 'icglr:MineSite';
    res.setHeader('Content-Type', 'application/ld+json');
  }
  
  res.json(mineSite);
}
```

### Step 9: GraphQL Implementation (Optional)

Implement GraphQL endpoint:

```javascript
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true
}));
```

## Testing

### Unit Tests

Test individual functions:

```javascript
describe('MiningOperation', () => {
  it('should validate required fields', () => {
    const data = { name: 'Test Mine' };
    const result = validator.validate(data, 'mining-operation');
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests

Test API endpoints:

```javascript
describe('GET /mining-operations', () => {
  it('should return paginated results', async () => {
    const res = await request(app)
      .get('/v1/mining-operations?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
  });
});
```

### Conformance Tests

Run conformance test suite:

```bash
npm test -- --grep "Level 1"
```

## Deployment

### Environment Variables

```bash
# API Configuration
API_PORT=8080
API_VERSION=v1

# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# External Services
ICGLR_API_URL=https://api.icglr.org
```

### Docker Deployment

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

### Health Check

Implement health check endpoint:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
```

## Best Practices

### 1. Data Transformation

- Transform at API boundary
- Keep internal model separate
- Use adapters for complex transformations

### 2. Caching

- Cache schema validations
- Cache frequently accessed data
- Use ETags for conditional requests

### 3. Logging

- Log all API requests
- Log validation errors
- Log security events
- Use structured logging

### 4. Monitoring

- Monitor response times
- Track error rates
- Alert on failures
- Monitor resource usage

### 5. Documentation

- Keep API docs up to date
- Provide examples
- Document customizations
- Include troubleshooting guide

## Common Issues

### Issue: Schema Validation Fails

**Solution**: Check that all required fields are present and data types match.

### Issue: Date Format Errors

**Solution**: Always use ISO 8601 format (YYYY-MM-DD for dates, YYYY-MM-DDTHH:mm:ssZ for date-times).

### Issue: Geographic Coordinates Invalid

**Solution**: Ensure latitude is between -90 and 90, longitude between -180 and 180.

### Issue: Pagination Not Working

**Solution**: Verify that pagination metadata includes all required fields.

## Getting Help

- Review examples in `examples/`
- Check conformance rules in `conformance/rules.md`
- Contact ICGLR Secretariat for support

## Next Steps

1. Implement Level 1 conformance (required)
2. Test with conformance suite
3. Deploy to staging
4. Get certification
5. Deploy to production


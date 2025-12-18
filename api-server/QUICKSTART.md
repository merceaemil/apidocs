# Quick Start Guide

Generate and run a REST API server from ICGLR OpenAPI specification and JSON schemas.

## Prerequisites

- Node.js 18+ installed
- npm installed

## Setup (5 minutes)

```bash
# 1. Navigate to api-server directory
cd api-server

# 2. Install dependencies
npm install

# 3. Generate database schema from JSON schemas
npm run generate:db

# 4. (Optional) Seed with example data
npm run seed

# 5. Start the server
npm start
```

## Access the API

- **API Base URL**: `http://localhost:3000/v1`
- **Swagger UI**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`

## Test the API

```bash
# List mine sites
curl http://localhost:3000/v1/mine-sites

# Get specific mine site
curl http://localhost:3000/v1/mine-sites/RW-1.9641+30.0619-00001

# Create mine site (from example)
curl -X POST http://localhost:3000/v1/mine-sites \
  -H "Content-Type: application/json" \
  -d @../examples/json/mine-site-example.json
```

## What's Generated?

1. **Database Schema** (SQLite)
   - Tables for all entities (Mine Sites, Export Certificates, Lots, etc.)
   - Foreign keys and relationships
   - Indexes for performance

2. **API Routes**
   - All endpoints from `api/openapi.yaml`
   - Request/response validation
   - Error handling

3. **Swagger Documentation**
   - Interactive API docs
   - Try-it-out functionality
   - Schema documentation

## Next Steps

1. Implement remaining handlers (see `src/handlers/`)
2. Add authentication
3. Deploy to production
4. Add GraphQL endpoint

## Troubleshooting

**Database not found:**
```bash
npm run generate:db
```

**Port already in use:**
```bash
PORT=3001 npm start
```

**Validation errors:**
- Check that JSON follows snake_case naming
- Verify ICGLR ID format: `CC-[Lat]-[Long]-NNNNN`
- Ensure status codes are integers (0, 1, 2, 3)


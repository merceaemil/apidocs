# Generating REST API from ICGLR Standards

This guide explains how to automatically generate a REST API server from the ICGLR OpenAPI specification and JSON schemas.

## Available Tools

### Option 1: Fastify with OpenAPI (Recommended)

**Fastify** is a fast and low overhead web framework that has excellent OpenAPI support.

**Setup:**
```bash
cd api-server
npm install
npm run generate:db
npm start
```

**Features:**
- Auto-generates routes from OpenAPI spec
- Built-in Swagger UI at `/docs`
- JSON schema validation
- SQLite database with auto-generated schema

### Option 2: OpenAPI Generator

**OpenAPI Generator** can generate server stubs in multiple languages.

**Installation:**
```bash
npm install -g @openapitools/openapi-generator-cli
```

**Generate Node.js/Express server:**
```bash
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g nodejs-express-server \
  -o api-server-generated
```

**Generate Fastify server:**
```bash
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g nodejs-fastify \
  -o api-server-generated
```

### Option 3: Swagger Codegen

**Swagger Codegen** (older, but still works):

```bash
npm install -g swagger-codegen-cli
swagger-codegen generate \
  -i api/openapi.yaml \
  -l nodejs-express-server \
  -o api-server-generated
```

### Option 4: Prisma + OpenAPI

**Prisma** can generate database schemas and APIs:

1. Generate Prisma schema from JSON schemas
2. Use Prisma Client for database operations
3. Build Fastify/Express routes manually or use code generation

## Recommended Approach: Fastify Setup

The `api-server/` directory contains a complete setup:

### 1. Install Dependencies

```bash
cd api-server
npm install
```

### 2. Generate Database Schema

```bash
npm run generate:db
```

This creates SQLite tables from JSON schemas.

### 3. Generate API Routes (Optional)

```bash
npm run generate:api
```

This generates route handlers from OpenAPI spec.

### 4. Start Server

```bash
npm start
```

Access:
- API: `http://localhost:3000/v1`
- Swagger UI: `http://localhost:3000/docs`

## Database Schema Generation

The `generate-db-schema.js` script:
- Reads JSON schemas
- Creates SQLite tables
- Sets up foreign keys
- Creates indexes
- Handles many-to-many relationships

## API Route Generation

The `generate-api.js` script:
- Reads OpenAPI specification
- Generates route handlers
- Sets up validation schemas
- Creates route index file

## Manual Implementation

If you prefer manual implementation:

1. **Use Fastify with @fastify/swagger**:
   ```javascript
   const fastify = require('fastify');
   await fastify.register(require('@fastify/swagger'), {
     openapi: require('../api/openapi.yaml')
   });
   ```

2. **Use express-openapi-validator**:
   ```javascript
   const express = require('express');
   const OpenApiValidator = require('express-openapi-validator');
   
   app.use(
     OpenApiValidator.middleware({
       apiSpec: './api/openapi.yaml',
       validateRequests: true,
       validateResponses: true
     })
   );
   ```

## Database Options

### SQLite (Included)
- Lightweight, file-based
- Good for development and small deployments
- Auto-generated schema in `api-server/scripts/generate-db-schema.js`

### PostgreSQL/MySQL
- Use Prisma or TypeORM
- Generate schema from JSON schemas
- Better for production

### MongoDB
- Use Mongoose
- Schema validation with JSON schemas
- More flexible for nested structures

## Validation

All requests are validated using:
- JSON schemas from `schemas/`
- OpenAPI request/response schemas
- Custom validators in `conformance/validators/`

## Example: Complete Setup

```bash
# 1. Install dependencies
cd api-server
npm install

# 2. Generate database
npm run generate:db

# 3. Seed with examples (optional)
npm run seed

# 4. Start server
npm start

# 5. Test API
curl http://localhost:3000/v1/mine-sites
curl http://localhost:3000/docs  # Swagger UI
```

## Next Steps

1. Implement remaining handlers (see `api-server/src/handlers/`)
2. Add authentication/authorization
3. Add GraphQL endpoint (see `graphql/schema.graphql`)
4. Deploy to production
5. Add monitoring and logging

## Notes

- The generated API follows the ICGLR semantic model exactly
- All field names use camelCase
- Status codes are integers (0, 1, 2, 3)
- ICGLR ID format is validated automatically
- Database schema matches JSON schemas


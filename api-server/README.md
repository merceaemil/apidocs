# ICGLR API Server - Auto-generated from OpenAPI

This is an auto-generated REST API server for the ICGLR Mining Sector Data Sharing Protocol, built from the OpenAPI specification and JSON schemas.

## Features

- ✅ **Auto-generated from OpenAPI**: Complete Express.js server generated from `api/openapi.yaml`
- ✅ **SQLite Database**: Lightweight database with auto-generated schema
- ✅ **JSON Schema Validation**: Request/response validation using JSON schemas
- ✅ **Swagger UI**: Interactive API documentation at `/api-docs`
- ✅ **OpenAPI Spec**: Raw OpenAPI specification available at `/openapi` (YAML) and `/openapi.json` (JSON)
- ✅ **Type-safe**: Schema-based validation ensures data integrity

## Quick Start

### 1. Install Dependencies

```bash
cd api-server
npm install
```

### 2. Generate API Server

Generates a complete Express.js server with routes, services, and database integration:

```bash
npm run api:generate
```

This creates a fully functional server in `src/` with:
- Express.js routes for all OpenAPI endpoints
- Service layer with database operations (CRUD, filtering, pagination)
- Middleware for validation and error handling
- Full integration with SQLite database schema

The generated API includes:
- **Mine Sites** (`/mine-sites`) - Full CRUD operations
- **Export Certificates** (`/export-certificates`) - List, get, and create
- **Lots** (`/lots`) - List, get, and create
- **GraphQL** (`/graphql`) - Placeholder for GraphQL implementation
- **Health Check** (`/health`) - API health status

### 3. Generate Database Schema

```bash
npm run generate:db
```

This automatically generates SQLite database schema from JSON schemas using the `json-schema-to-sql` generator. The generator:
- Reads all JSON schemas from `schemas/`
- Resolves `$ref` references automatically
- Generates SQL DDL statements
- Creates tables, foreign keys, and indexes
- Handles nested objects and arrays

### 4. Start Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The API will be available at:
- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI Spec (YAML): `http://localhost:3000/openapi`
- OpenAPI Spec (JSON): `http://localhost:3000/openapi.json`
- Health Check: `http://localhost:3000/health`

## API Endpoints

All endpoints from `api/openapi.yaml` are automatically available:

- `GET /v1/mine-sites` - List mine sites
- `GET /v1/mine-sites/{icglrId}` - Get mine site
- `POST /v1/mine-sites` - Create mine site
- `PUT /v1/mine-sites/{icglrId}` - Update mine site
- `GET /v1/export-certificates` - List export certificates
- `GET /v1/export-certificates/{identifier}` - Get export certificate
- `POST /v1/export-certificates` - Create export certificate
- `GET /v1/lots` - List lots
- `GET /v1/lots/{lotNumber}` - Get lot
- `POST /v1/lots` - Create lot
- `POST /v1/graphql` - GraphQL endpoint

## Database

The server uses SQLite for data storage. The database file is created at `data/icglr.db`.

### Database Schema

The schema is automatically generated from JSON schemas:
- `mineSites` table
- `exportCertificates` table
- `lots` table
- `businessEntities` table
- `licenses` table
- `inspections` table
- `tags` table
- `taxes` table

### Migrations

```bash
npm run migrate
```

### Seed Data

```bash
npm run seed
```

This loads example data from `examples/json/`.

## Configuration

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/icglr.db
API_VERSION=v1
JWT_SECRET=your-secret-key
```

## Development

### Project Structure

```
api-server/
├── src/
│   ├── server.js              # Server entry point (uses generated server)
│   ├── generated/             # OpenAPI-generated Express server
│   │   ├── controllers/       # Auto-generated controllers
│   │   ├── services/          # Service layer (edit these for business logic)
│   │   ├── expressServer.js   # Express server setup
│   │   └── index.js           # Generated server entry point
│   ├── database/              # Database connection and models
│   └── validators/            # JSON schema validators
├── scripts/
│   ├── generate-api-openapi.js # Generate API from OpenAPI spec
│   ├── generate-db-schema.js   # Generate DB schema from JSON schemas
│   ├── migrate.js              # Database migrations
│   └── seed.js                # Seed database with examples
├── data/                       # SQLite database files
└── package.json
```

## Validation

All requests are automatically validated against JSON schemas:
- Request body validation
- Query parameter validation
- Response validation
- ICGLR ID format validation
- Status code validation

## Error Handling

The API returns standardized error responses:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "field": "icglr_id",
    "reason": "Invalid format"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Testing

Test the API using the examples:

```bash
# Create a mine site
curl -X POST http://localhost:3000/v1/mine-sites \
  -H "Content-Type: application/json" \
  -d @../examples/json/mine-site-example.json

# List mine sites
curl http://localhost:3000/v1/mine-sites?addressCountry=RW

# Get mine site
curl http://localhost:3000/v1/mine-sites/RW-1.9641+30.0619-00001
```

## API Generation

The `generate-api.js` script automatically generates:

1. **Routes** (`src/routes/`) - Express route handlers for all OpenAPI endpoints
2. **Services** (`src/services/`) - Business logic and database operations
3. **Middleware** (`src/middleware/`) - Validation and error handling
4. **Server** (`src/server.js`) - Main Express application

### Features

- ✅ Full CRUD operations for all resources
- ✅ Request validation using JSON schemas
- ✅ Database integration with SQLite
- ✅ Pagination and filtering support
- ✅ Error handling with proper HTTP status codes
- ✅ Nested object reconstruction (business entities, addresses, etc.)

### Regenerating the API

After updating `api/openapi.yaml`, regenerate the API:

```bash
npm run api:generate
```

**Note:** This will overwrite files in `src/routes/`, `src/services/`, `src/middleware/`, and `src/server.js`. If you've made custom modifications, you may need to reapply them.

## Notes

- The API is generated from OpenAPI spec, so any changes to `api/openapi.yaml` should be reflected
- Database schema is generated from JSON schemas
- All validation uses the same JSON schemas as the standard
- The server follows the ICGLR semantic model exactly
- Mine site locations are not directly linked in the schema - this may need schema updates for full functionality


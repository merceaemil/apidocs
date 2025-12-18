# GraphQL Resolvers

This directory contains example GraphQL resolver implementations for the ICGLR Mining Sector Data Sharing Protocol.

## Purpose

The GraphQL schema enables flexible querying of APIs that may have different structures than those mandated by the ICGLR standard. This is particularly useful for:

1. **Legacy System Integration**: Querying existing systems that don't fully conform to the standard
2. **Multi-Source Aggregation**: Combining data from multiple sources with different schemas
3. **Flexible Data Extraction**: Allowing implementers to expose data in ways that suit their infrastructure
4. **Chain of Custody Tracking**: Querying lot transformations and CoC operations

## Implementation Notes

### Query Resolvers

Resolvers should:
- Validate input parameters
- Transform data from backend storage to GraphQL schema format
- Handle pagination
- Support filtering and sorting
- Return appropriate error messages
- Convert snake_case backend fields to GraphQL camelCase (if needed)

### Mutation Resolvers

Mutations should:
- Validate input data against JSON schemas
- Transform GraphQL input to backend format (snake_case)
- Handle business logic and validation
- Return created/updated entities
- Validate ICGLR ID format for mine sites
- Validate status codes (integers, not strings)

### Entity-Specific Resolvers

#### Mine Sites (MD.01)
- Validate `icglr_id` format: `CC-[Lat]-[Long]-NNNNN`
- Handle certification status as integer (0, 1, 2, 3)
- Support filtering by address_country, certification_status, activity_status, mineral

#### Export Certificates (MD.03)
- Handle exporter and importer BusinessEntity
- Validate mineral origin format (country codes separated by space)
- Support date range filtering

#### Lots (MD.12)
- Handle recursive input_lot references
- Validate conditional requirements (mine_site_id and tag required for Production)
- Support filtering by creator_role, originating_operation
- Track Chain of Custody transformations

### Flexible Query Endpoint

The `query` field in the Query type allows executing arbitrary queries against non-standard APIs:

```graphql
query {
  query(
    endpoint: "https://legacy-api.example.com/graphql"
    query: """
    {
      mines {
        name
        location
        production {
          amount
          year
        }
      }
    }
    """
  )
}
```

This enables federated querying across different API structures.

## Example Implementations

Example resolver implementations can be found in:
- Node.js/TypeScript: `typescript/`
- Python: `python/`
- Java: `java/`

## Testing

Resolvers should be tested with:
- Unit tests for individual resolver functions
- Integration tests with actual API endpoints
- Conformance tests to ensure standard compliance
- Validation of ICGLR ID format
- Validation of status code integers
- Validation of snake_case field names

## Key Considerations

1. **Field Naming**: Backend uses snake_case, GraphQL may use camelCase - handle conversion
2. **Status Codes**: Always use integers (0, 1, 2, 3) not strings
3. **ICGLR ID Format**: Validate format `CC-[Lat]-[Long]-NNNNN`
4. **Mineral Codes**: Support both HS Codes and IMA Codes
5. **Chain of Custody**: Handle recursive lot references and transformations

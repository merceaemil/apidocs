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
- Convert backend fields as needed (the standard uses camelCase)

### Mutation Resolvers

Mutations should:
- Validate input data against JSON schemas
- Transform GraphQL input to backend format (camelCAse)
- Handle business logic and validation
- Return created/updated entities
- Validate ICGLR ID format for mine sites
- Validate status codes (integers, not strings)

### Entity-Specific Resolvers

#### Mine Sites (MD.01)
- Validate `icglrId` format: `CC-[Lat]-[Long]-NNNNN`
- Handle certification status as integer (0, 1, 2, 3)
- Support filtering by addressCountry, certificationStatus, activityStatus, mineral

#### Export Certificates (MD.03)
- Handle exporter and importer BusinessEntity
- Validate mineral origin format (country codes separated by space)
- Support date range filtering

#### Lots (MD.12)
- Handle recursive inputLot references
- Validate conditional requirements (mineSiteId and tag required for Production)
- Support filtering by creatorRole, originatingOperation
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
- Validation of camelCase field names

## Key Considerations

1. **Field Naming**: Backend uses camelCase, GraphQL may use camelCase - handle conversion
2. **Status Codes**: Always use integers (0, 1, 2, 3) not strings
3. **ICGLR ID Format**: Validate format `CC-[Lat]-[Long]-NNNNN`
4. **Mineral Codes**: Support both HS Codes and IMA Codes
5. **Chain of Custody**: Handle recursive lot references and transformations

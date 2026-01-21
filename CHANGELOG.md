# Changelog

All notable changes to the ICGLR Mining Sector Data Sharing Protocol Standards will be documented in this file.

## [1.0.0] - 2024

### Added

- Initial release based on ICGLR Data Sharing Protocol Standards semantic model
- JSON schemas for all primary and secondary entities:
  - MD.01 Mine Site
  - MD.02 License
  - MD.03 Export Certificate
  - MD.04 Business Entity
  - MD.05 Address
  - MD.06 Geolocalization
  - MD.07 Inspection
  - MD.08 Mine Site Location
  - MD.09 Contact Details
  - MD.10 Status History
  - MD.11 Tag
  - MD.12 Lot (Chain of Custody)
  - MD.13 Tax
- Code lists (MDC.01 - MDC.06):
  - Certification Status (0, 1, 2, 3)
  - Mining Activity Status (0, 1, 2)
  - Mineral (HS Codes and IMA Codes)
  - License Type
  - CoC Roles (1-8)
  - Originating Operations (1-8)
- OpenAPI/Swagger specification with camelCase naming
- JSON-LD context for semantic interoperability
- GraphQL schema for flexible querying
- Conformance rules and validation tools
- Implementation guide and examples
- API request examples
- Documentation and architecture guides

### Features

- **ICGLR ID Format**: Standardized mine site identification (`CC-[Lat]-[Long]-NNNNN`)
- **camelCase Naming**: All technical terms use camelCase convention
- **Integer Status Codes**: Language-independent status codes
- **Chain of Custody**: Complete Lot entity supporting all CoC operations
- **Mineral Codes**: Support for HS Codes and IMA Codes
- **ISO 3166-2 Addresses**: Subnational divisions using ISO 3166-2 format

### Notes

- This standard is designed for **data exchange**, not as a relational database schema
- Countries can extend the model with additional fields while maintaining compatibility
- All field names use camelCase as specified in the semantic model
- Status values use integer codes for language independence


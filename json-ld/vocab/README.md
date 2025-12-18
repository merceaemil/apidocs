# ICGLR Vocabulary

This directory contains vocabulary definitions for the ICGLR Mining Sector Data Sharing Protocol Standards.

## Vocabulary Base URI

- **Base URI**: `https://icglr.org/vocab/`
- **Prefix**: `icglr:`

## Primary Entity Classes

- `icglr:MineSite` - Mine site entity (MD.01)
- `icglr:ExportCertificate` - ICGLR export certificate (MD.03)
- `icglr:Lot` - Chain of Custody lot (MD.12)

## Secondary Entity Classes

- `icglr:License` - Mining license (MD.02)
- `icglr:BusinessEntity` - Business entity/company (MD.04)
- `icglr:Address` - Address with ISO 3166-2 subdivisions (MD.05)
- `icglr:Geolocalization` - Geographic coordinates (MD.06)
- `icglr:Inspection` - Mine site inspection (MD.07)
- `icglr:MineSiteLocation` - Mine site location details (MD.08)
- `icglr:ContactDetails` - Contact information (MD.09)
- `icglr:StatusHistory` - Certification status history (MD.10)
- `icglr:Tag` - Lot tag (MD.11)
- `icglr:Tax` - Tax payment information (MD.13)

## External Vocabularies Used

- **Schema.org** (`schema:`): For general-purpose structured data
- **Dublin Core** (`dc:`): For metadata properties
- **WGS84 Geo** (`geo:`): For geographic coordinates
- **RDF/RDFS** (`rdf:`, `rdfs:`): For RDF foundations

## Usage

The JSON-LD context is defined in `../context.jsonld`. To use it in your JSON data:

```json
{
  "@context": "https://icglr.org/json-ld/context.jsonld",
  "@type": "icglr:MineSite",
  "icglr_id": "RW-1.9641+30.0619-00001",
  "address_country": "RW",
  "certification_status": 1,
  "mine_site_location": {
    "@type": "icglr:MineSiteLocation",
    "geolocalization": {
      "@type": "icglr:Geolocalization",
      "latitude": -1.9641,
      "longitude": 30.0619
    }
  }
}
```

## Field Naming

All technical terms use **snake_case** convention:
- `icglr_id`
- `certification_status`
- `mine_site_location`
- `date_of_issuance`

## Code Lists

Status values use integer codes for language independence:
- Certification Status: 0=Blue, 1=Green, 2=Yellow, 3=Red
- Activity Status: 0=Abandoned, 1=Active, 2=Non-active
- CoC Roles: 1=Miner, 2=Trader, 3=Shipper, 4=Processor, 5=Warehouse, 6=Importer, 7=Exporter, 8=Government
- Originating Operations: 1=Production, 2=Purchase, 3=Combination, 4=Processing, 5=Transportation, 6=Storage/Warehousing, 7=Import, 8=Export

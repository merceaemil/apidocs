# ICGLR Mining Sector Data Sharing Protocol - Deployment Guide

## Git Repository Deployment

This guide explains how to deploy this standard to the ICGLR Git organization.

## Prerequisites

1. Access to ICGLR Git organization
2. Git client installed
3. Appropriate permissions to create repositories

## Repository Setup

### 1. Create Repository in ICGLR Organization

1. Go to ICGLR Git organization
2. Create new repository: `mining-data-sharing-protocol`
3. Set repository visibility (public recommended for standards)
4. Initialize with README (optional, we have one)

### 2. Clone and Prepare

```bash
# Clone the ICGLR repository (empty or with README)
git clone https://github.com/icglr/mining-data-sharing-protocol.git
cd mining-data-sharing-protocol

# If repository has content, pull first
git pull origin main
```

### 3. Add All Files

```bash
# Copy all project files to repository directory
# (if not already there)

# Add all files
git add .

# Verify what will be committed
git status
```

### 4. Initial Commit

```bash
git commit -m "Initial commit: ICGLR Mining Sector Data Sharing Protocol v1.0.0

- JSON schemas for Mine Sites (MD.01), Export Certificates (MD.03), and Chain of Custody Lots (MD.12)
- OpenAPI/Swagger specification for RESTful APIs with snake_case naming
- JSON-LD context for semantic interoperability
- GraphQL schema for flexible querying
- Conformance rules and validation tools
- Implementation guide and examples
- Based on ICGLR Data Sharing Protocol Standards semantic model"
```

### 5. Push to Repository

```bash
# Set remote (if not already set)
git remote add origin https://github.com/icGLR/mining-data-sharing-protocol.git

# Push to main branch
git push -u origin main
```

## Repository Structure

The repository should contain:

```
.
├── README.md                          # Main documentation
├── LICENSE.md                         # License information
├── CONTRIBUTING.md                    # Contribution guidelines
├── DEPLOYMENT.md                      # This file
├── package.json                       # Node.js dependencies
├── .gitignore                         # Git ignore rules
│
├── schemas/                           # JSON Schema definitions
│   ├── core/
│   │   └── common.json
│   ├── mining-operations/
│   │   ├── mining-operation.json
│   │   └── production.json
│   ├── compliance/
│   │   └── compliance-report.json
│   └── environmental/
│       └── environmental-impact.json
│
├── api/                               # API specifications
│   ├── openapi.yaml                  # OpenAPI/Swagger spec
│   └── examples/                      # API examples
│
├── json-ld/                           # JSON-LD definitions
│   ├── context.jsonld                # Main context
│   └── vocab/                         # Vocabulary
│
├── graphql/                           # GraphQL schemas
│   ├── schema.graphql                 # Main schema
│   └── resolvers/                     # Resolver examples
│
├── conformance/                       # Conformance rules
│   ├── rules.md                      # Conformance rules
│   ├── validators/                   # Validation tools
│   └── test-suites/                  # Test cases
│
├── examples/                          # Examples
│   ├── json/                         # JSON examples
│   └── requests/                     # API request examples
│
└── docs/                              # Documentation
    ├── architecture.md               # Architecture overview
    └── implementation-guide.md       # Implementation guide
```

## Branching Strategy

### Main Branch

- `main` or `master`: Stable, released versions
- Protected branch (require reviews for changes)

### Development Branches

- `develop`: Integration branch for ongoing work
- `feature/*`: Feature development
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

## Versioning

Use semantic versioning (SemVer):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Creating Releases

```bash
# Tag a release
git tag -a v1.0.0 -m "ICGLR Mining Sector Data Sharing Protocol v1.0.0"
git push origin v1.0.0

# Create release in Git UI with:
# - Release notes
# - Changelog
# - Download links (if applicable)
```

## Continuous Integration (Optional)

Set up CI/CD for:
- Schema validation
- OpenAPI spec validation
- Documentation generation
- Automated testing

Example GitHub Actions workflow:

```yaml
# .github/workflows/validate.yml
name: Validate Schemas
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run validate
```

## Documentation Hosting

### Option 1: GitHub Pages

1. Enable GitHub Pages in repository settings
2. Use `/docs` folder or `gh-pages` branch
3. Access at: `https://icglr.github.io/mining-data-sharing-protocol/`

### Option 2: External Hosting

- Host OpenAPI docs on Swagger UI
- Host JSON-LD context on ICGLR domain
- Host GraphQL schema explorer

## Access Control

### Public Repository (Recommended)

- **Pros**: Easy access, transparency, community engagement
- **Cons**: Public visibility

### Private Repository

- **Pros**: Controlled access
- **Cons**: Limited visibility, requires access management

### Organization Settings

- Repository permissions
- Branch protection rules
- Required reviews
- Status checks

## Maintenance

### Regular Updates

1. Update schemas based on feedback
2. Version new releases
3. Update documentation
4. Maintain changelog

### Issue Tracking

- Use Git issues for:
  - Bug reports
  - Feature requests
  - Questions
  - Discussions

### Pull Request Process

1. Create feature branch
2. Make changes
3. Submit pull request
4. Review and discuss
5. Merge after approval

## Post-Deployment

### Announcements

1. Announce to ICGLR member states
2. Notify implementers
3. Update ICGLR website
4. Share in relevant forums

### Support

1. Set up support channels
2. Create FAQ document
3. Provide contact information
4. Schedule training sessions (if needed)

## Verification

After deployment, verify:

- [ ] All files are present
- [ ] Links work correctly
- [ ] Schemas validate
- [ ] OpenAPI spec is valid
- [ ] Examples are correct
- [ ] Documentation is complete
- [ ] Repository is accessible
- [ ] Permissions are correct

## Next Steps

1. **Initial Release**: Deploy v1.0.0
2. **Feedback Collection**: Gather feedback from member states
3. **Iteration**: Update based on feedback
4. **Certification**: Establish certification process
5. **Adoption**: Support implementers

## Contact

For deployment issues, contact ICGLR Secretariat or repository administrators.


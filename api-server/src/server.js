/**
 * ICGLR API Server
 * Auto-generated from OpenAPI specification
 */

require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const errorHandler = require('./middleware/error-handler');

// Import routes
const mineSitesRoutes = require('./routes/mine-sites');
const exportCertificatesRoutes = require('./routes/export-certificates');
const lotsRoutes = require('./routes/lots');
const graphqlRoutes = require('./routes/graphql');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../api/openapi.yaml');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ICGLR API Documentation'
}));

// OpenAPI specification endpoints
app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

app.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.send(fs.readFileSync(openApiPath, 'utf8'));
});

// Routes
app.use('/mine-sites', mineSitesRoutes);
app.use('/export-certificates', exportCertificatesRoutes);
app.use('/lots', lotsRoutes);
app.use('/graphql', graphqlRoutes);
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ICGLR Mining Sector Data Sharing Protocol API',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs',
      openapiJson: '/openapi.json',
      openapiYaml: '/openapi.yaml'
    },
    endpoints: {
      mineSites: '/mine-sites',
      exportCertificates: '/export-certificates',
      lots: '/lots',
      graphql: '/graphql',
      health: '/health'
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✓ ICGLR API Server running on http://localhost:${PORT}`);
  console.log(`  Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`  OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  Mine Sites: http://localhost:${PORT}/mine-sites`);
  console.log(`  Export Certificates: http://localhost:${PORT}/export-certificates`);
  console.log(`  Lots: http://localhost:${PORT}/lots`);
});

module.exports = app;

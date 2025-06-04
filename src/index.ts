import express from 'express';
import path from 'path';
import { OpenFgaClient } from '@openfga/sdk';
import { config } from './config';
import { AuthzService } from './services/authz.service';
import { setupRoutes } from './routes';

async function main() {
  const app = express();
  app.use(express.json());
  
  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Initialize OpenFGA client
  const fgaClient = new OpenFgaClient({
    apiUrl: config.OPENFGA_API_URL,
    storeId: config.OPENFGA_STORE_ID,
    authorizationModelId: config.OPENFGA_AUTHORIZATION_MODEL_ID,
  });

  // Initialize AuthZ service
  const authzService = new AuthzService(fgaClient);

  // Setup routes
  setupRoutes(app, authzService);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Start server
  const port = config.PORT || 3001;
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔐 OpenFGA API: ${config.OPENFGA_API_URL}`);
  });
}

main().catch(console.error); 
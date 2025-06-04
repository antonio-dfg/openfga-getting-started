const fs = require('fs');
const path = require('path');

// Setup script for OpenFGA store and authorization model
async function setup() {
  console.log('🔧 Setting up OpenFGA store and authorization model...');

  try {
    // Import OpenFGA SDK
    const { OpenFgaClient } = require('@openfga/sdk');
    
    // Initialize client
    const fgaClient = new OpenFgaClient({
      apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080'
    });

    // Step 1: Create a new store
    console.log('📦 Creating OpenFGA store...');
    const storeResponse = await fgaClient.createStore({
      name: 'openfga-getting-started'
    });
    
    const storeId = storeResponse.id;
    console.log(`✅ Store created with ID: ${storeId}`);

    // Step 2: Load authorization model
    console.log('📋 Loading authorization model...');
    const modelPath = path.join(__dirname, '..', 'models', 'authorization-model.json');
    const authorizationModel = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

    // Update client with store ID
    const clientWithStore = new OpenFgaClient({
      apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
      storeId: storeId
    });

    // Write authorization model
    const modelResponse = await clientWithStore.writeAuthorizationModel(authorizationModel);
    const authorizationModelId = modelResponse.authorization_model_id;
    console.log(`✅ Authorization model created with ID: ${authorizationModelId}`);

    // Step 3: Update .env file
    console.log('📝 Updating .env file...');
    const envPath = path.join(__dirname, '..', '.env');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add environment variables
    const envVars = {
      'OPENFGA_API_URL': process.env.OPENFGA_API_URL || 'http://localhost:8080',
      'OPENFGA_STORE_ID': storeId,
      'OPENFGA_AUTHORIZATION_MODEL_ID': authorizationModelId,
      'PORT': '3001'
    };

    let newEnvContent = envContent;
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const line = `${key}=${value}`;
      
      if (regex.test(newEnvContent)) {
        newEnvContent = newEnvContent.replace(regex, line);
      } else {
        newEnvContent += newEnvContent.endsWith('\n') || newEnvContent === '' ? '' : '\n';
        newEnvContent += line + '\n';
      }
    }

    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ .env file updated');

    // Step 4: Summary
    console.log('\n🎉 Setup completed successfully!');
    console.log('\nConfiguration:');
    console.log(`  Store ID: ${storeId}`);
    console.log(`  Authorization Model ID: ${authorizationModelId}`);
    console.log(`  API URL: ${process.env.OPENFGA_API_URL || 'http://localhost:8080'}`);
    console.log('\nNext steps:');
    console.log('  1. Run "npm run dev" to start the application server');
    console.log('  2. Test the API endpoints as described in README.md');
    console.log('  3. Visit http://localhost:3000 for OpenFGA playground');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. OpenFGA server is running (npm run docker:up)');
    console.error('  2. Dependencies are installed (npm install)');
    console.error('  3. Port 8080 is accessible');
    process.exit(1);
  }
}

// Check if OpenFGA server is accessible
async function checkOpenFGAConnection() {
  try {
    // Use the OpenFGA SDK to test connection instead of fetch
    const { OpenFgaClient } = require('@openfga/sdk');
    const testClient = new OpenFgaClient({
      apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080'
    });
    
    // Try to list stores to test connection
    await testClient.listStores();
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking OpenFGA server connection...');
  const isConnected = await checkOpenFGAConnection();
  
  if (!isConnected) {
    console.error('❌ Cannot connect to OpenFGA server');
    console.error('Please run "npm run docker:up" first to start OpenFGA server');
    process.exit(1);
  }
  
  console.log('✅ OpenFGA server is accessible');
  await setup();
}

if (require.main === module) {
  main();
}

module.exports = { setup }; 
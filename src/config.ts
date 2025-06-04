import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  OPENFGA_API_URL: process.env.OPENFGA_API_URL || 'http://localhost:8080',
  OPENFGA_STORE_ID: process.env.OPENFGA_STORE_ID || '',
  OPENFGA_AUTHORIZATION_MODEL_ID: process.env.OPENFGA_AUTHORIZATION_MODEL_ID || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
}; 
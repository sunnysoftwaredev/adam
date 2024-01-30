import dotenv from 'dotenv';
import fs from 'fs';

// Check if '.env' file exists before attempting to load it
if (fs.existsSync('.env')) {
  dotenv.config();
} else {
  console.warn("Warning: '.env' file is not found. Default environment variables will be used.");
}

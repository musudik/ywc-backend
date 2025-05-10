const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found. Using environment variables from the system.');
  dotenv.config();
}

console.log('Starting database migration process...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run migration
  console.log('Running database migration...');
  execSync('npx prisma migrate dev --name remove_firebase_auth', { stdio: 'inherit' });
  
  // Seed the database
  console.log('Seeding the database...');
  execSync('npm run seed', { stdio: 'inherit' });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
} 
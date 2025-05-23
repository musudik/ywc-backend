// Script to apply the client_forms migration
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get database connection info from environment variables
const dbUrl = process.env.DATABASE_URL;

async function main() {
  console.log('Starting migration for client_forms table...');
  
  // Create a new client
  const client = new Client({
    connectionString: dbUrl
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');
    
    // Check if client_forms table already exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'client_forms'
      )
    `);

    if (tableExists.rows[0].exists) {
      console.log('client_forms table already exists. Skipping table creation.');
    } else {
      // Create the client_forms table
      console.log('Creating client_forms table...');
      
      await client.query(`
        CREATE TABLE "client_forms" (
          "id" TEXT NOT NULL,
          "formId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          "formType" TEXT NOT NULL,
          "formName" TEXT NOT NULL,
          "formData" JSONB NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'Submitted',
          "lastEditedBy" TEXT,
          CONSTRAINT "client_forms_pkey" PRIMARY KEY ("id")
        )
      `);
      
      // Create unique constraint on formId
      await client.query(`
        CREATE UNIQUE INDEX "client_forms_formId_key" ON "client_forms"("formId")
      `);
      
      // Add foreign key constraint to reference users table
      await client.query(`
        ALTER TABLE "client_forms" ADD CONSTRAINT "client_forms_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      
      console.log('client_forms table created successfully.');
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    // Close the connection
    await client.end();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 
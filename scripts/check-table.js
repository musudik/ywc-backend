// Script to check the client_forms table structure
const { Client } = require('pg');
require('dotenv').config();

// Get database connection info from environment variables
const dbUrl = process.env.DATABASE_URL;

async function main() {
  console.log('Checking client_forms table structure...');
  
  // Create a new client
  const client = new Client({
    connectionString: dbUrl
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');
    
    // Get table columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'client_forms'
      ORDER BY ordinal_position
    `);
    
    console.log('client_forms table columns:');
    console.table(columnsResult.rows);
    
    // Get constraints
    const constraintsResult = await client.query(`
      SELECT con.conname AS constraint_name, 
             con.contype AS constraint_type,
             CASE 
               WHEN con.contype = 'p' THEN 'PRIMARY KEY'
               WHEN con.contype = 'f' THEN 'FOREIGN KEY'
               WHEN con.contype = 'u' THEN 'UNIQUE'
               ELSE con.contype::text
             END AS constraint_type_desc,
             pg_get_constraintdef(con.oid) AS constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE rel.relname = 'client_forms'
      ORDER BY con.conname
    `);
    
    console.log('client_forms table constraints:');
    console.table(constraintsResult.rows);
    
    console.log('Table verification completed.');
  } catch (err) {
    console.error('Error during table verification:', err);
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
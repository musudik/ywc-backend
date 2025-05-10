import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function checkDatabaseTables() {
  try {
    console.log('Checking database tables...');
    
    // Query the database for all tables in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('Tables in the database:');
    console.log('------------------------');
    (tables as { table_name: string }[]).forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Count of tables
    console.log(`\nTotal tables: ${(tables as any[]).length}`);
    
    // Check a few specific tables to ensure they exist
    const personalDetailsCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'personal_details'
    `;
    
    const employmentDetailsCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'employment_details'
    `;
    
    const incomeDetailsCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'income_details'
    `;
    
    console.log('\nVerification of specific tables:');
    console.log(`- personal_details exists: ${(personalDetailsCheck as any[])[0].count > 0 ? 'Yes' : 'No'}`);
    console.log(`- employment_details exists: ${(employmentDetailsCheck as any[])[0].count > 0 ? 'Yes' : 'No'}`);
    console.log(`- income_details exists: ${(incomeDetailsCheck as any[])[0].count > 0 ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('Error checking database tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables(); 
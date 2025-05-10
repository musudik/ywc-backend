import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function checkTableDetails() {
  try {
    console.log('Checking table details...');
    
    // Get all tables
    const tables = [
      'personal_details',
      'employment_details',
      'income_details',
      'expenses_details',
      'assets',
      'liabilities',
      'goals_and_wishes',
      'risk_appetite',
      'consents',
      'documents',
      'forms',
      'custom_forms'
    ];
    
    for (const tableName of tables) {
      // Get column information for the table
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      console.log(`\nTable: ${tableName}`);
      console.log('Columns:');
      console.log('--------------------------');
      (columns as any[]).forEach(column => {
        console.log(`${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      console.log('--------------------------');
    }
    
  } catch (error) {
    console.error('Error checking table details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableDetails(); 
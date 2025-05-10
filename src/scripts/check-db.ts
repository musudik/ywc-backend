import { PrismaClient } from '../../generated/prisma';

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log('Database Tables:');
    console.log('----------------');

    // For each table, get its columns
    for (const table of tables as { table_name: string }[]) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;

      console.log(`\nTable: ${table.table_name}`);
      console.log('Columns:');
      console.log('--------');
      (columns as any[]).forEach(column => {
        console.log(`${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 
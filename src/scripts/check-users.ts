import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkUsers() {
  try {
    console.log('Checking for users...');
    
    // Query all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });
    
    // Try to query specifically for our admin and coach users
    const adminUser = await prisma.user.findUnique({
      where: { email: 'master@yourwealth.coach' }
    });
    
    const coachUser = await prisma.user.findUnique({
      where: { email: 'coachgpt@yourwealth.coach' }
    });
    
    console.log('\nSpecific user check:');
    console.log('Admin user:', adminUser ? 'Found' : 'Not found');
    console.log('Coach user:', coachUser ? 'Found' : 'Not found');
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 
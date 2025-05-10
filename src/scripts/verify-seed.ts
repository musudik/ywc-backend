import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function verifySeededData() {
  try {
    console.log('Verifying seeded data...');

    // Get all roles
    const roles = await prisma.role.findMany();
    console.log('\n--- ROLES ---');
    roles.forEach(role => {
      console.log(`Name: ${role.name}`);
      console.log(`Description: ${role.description}`);
      console.log(`Permissions: ${role.permissions.join(', ')}`);
      console.log('--------------');
    });

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });
    console.log('\n--- USERS ---');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Display Name: ${user.displayName}`);
      console.log(`Role: ${user.role.name}`);
      console.log(`Email Verified: ${user.emailVerified}`);
      console.log('--------------');
    });

    console.log('\nVerification completed successfully!');
  } catch (error) {
    console.error('Error verifying seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeededData(); 
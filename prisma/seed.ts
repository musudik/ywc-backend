import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create default roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions: ['MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_CLIENTS', 'MANAGE_COACHES', 'MANAGE_CONTENT', 'VIEW_REPORTS']
    },
    {
      name: 'COACH',
      description: 'Financial coach who manages clients',
      permissions: ['MANAGE_OWN_CLIENTS', 'VIEW_CLIENT_DATA', 'CREATE_REPORTS']
    },
    {
      name: 'CLIENT',
      description: 'End user of the platform',
      permissions: ['VIEW_OWN_DATA', 'UPDATE_PROFILE', 'REQUEST_SERVICES']
    },
    {
      name: 'GUEST',
      description: 'Unregistered or limited access user',
      permissions: ['VIEW_PUBLIC_CONTENT']
    }
  ];

  console.log('Seeding roles...');

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name }
    });

    if (!existingRole) {
      await prisma.role.create({
        data: role
      });
      console.log(`Created role: ${role.name}`);
    } else {
      console.log(`Role ${role.name} already exists, skipping`);
    }
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
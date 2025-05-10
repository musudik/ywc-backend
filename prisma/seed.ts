import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Starting database seeding...');

  try {
    // Create Roles
    console.log('Creating roles...');
    const roles = [
      {
        name: 'ADMIN',
        description: 'Administrator with full access',
        permissions: [
          'MANAGE_USERS',
          'MANAGE_ROLES',
          'MANAGE_CLIENTS',
          'MANAGE_COACHES',
          'MANAGE_CONTENT',
          'VIEW_REPORTS'
        ]
      },
      {
        name: 'COACH',
        description: 'Financial coach who manages clients',
        permissions: [
          'MANAGE_OWN_CLIENTS',
          'VIEW_CLIENT_DATA',
          'CREATE_REPORTS'
        ]
      },
      {
        name: 'CLIENT',
        description: 'End user of the platform',
        permissions: [
          'VIEW_OWN_DATA',
          'UPDATE_PROFILE',
          'REQUEST_SERVICES'
        ]
      },
      {
        name: 'GUEST',
        description: 'Unregistered or limited access user',
        permissions: [
          'VIEW_PUBLIC_CONTENT'
        ]
      }
    ];

    for (const role of roles) {
      console.log(`Processing role: ${role.name}`);
      try {
        const result = await prisma.role.upsert({
          where: { name: role.name },
          update: {
            description: role.description,
            permissions: role.permissions
          },
          create: {
            name: role.name,
            description: role.description,
            permissions: role.permissions
          }
        });
        console.log(`Role "${role.name}" upserted successfully:`, result);
      } catch (roleError) {
        console.error(`Error upserting role "${role.name}":`, roleError);
      }
    }

    // Verify roles were created
    try {
      const allRoles = await prisma.role.findMany();
      console.log('All roles after creation:', allRoles);
    } catch (findRolesError) {
      console.error('Error finding roles:', findRolesError);
    }

    // Get role IDs
    console.log('Getting role IDs...');
    let adminRole, coachRole;
    
    try {
      adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
      console.log('Admin role:', adminRole);
    } catch (adminRoleError) {
      console.error('Error finding admin role:', adminRoleError);
    }
    
    try {
      coachRole = await prisma.role.findUnique({ where: { name: 'COACH' } });
      console.log('Coach role:', coachRole);
    } catch (coachRoleError) {
      console.error('Error finding coach role:', coachRoleError);
    }

    if (!adminRole || !coachRole) {
      throw new Error('Roles not found');
    }

    // Create Admin User
    console.log('Creating admin user...');
    try {
      const adminPassword = await bcrypt.hash('Team2025*', 10);
      const adminUser = await prisma.user.upsert({
        where: { email: 'master@yourwealth.coach' },
        update: {
          password: adminPassword,
          displayName: 'Master Admin',
          roleId: adminRole.id
        },
        create: {
          email: 'master@yourwealth.coach',
          password: adminPassword,
          displayName: 'Master Admin',
          roleId: adminRole.id,
          emailVerified: true
        }
      });
      console.log('Admin user created:', adminUser);
    } catch (adminUserError) {
      console.error('Error creating admin user:', adminUserError);
    }

    // Create Coach User
    console.log('Creating coach user...');
    try {
      const coachPassword = await bcrypt.hash('Team2025*', 10);
      const coachUser = await prisma.user.upsert({
        where: { email: 'coachgpt@yourwealth.coach' },
        update: {
          password: coachPassword,
          displayName: 'Coach GPT',
          roleId: coachRole.id
        },
        create: {
          email: 'coachgpt@yourwealth.coach',
          password: coachPassword,
          displayName: 'Coach GPT',
          roleId: coachRole.id,
          emailVerified: true
        }
      });
      console.log('Coach user created:', coachUser);
    } catch (coachUserError) {
      console.error('Error creating coach user:', coachUserError);
    }

    // Verify users were created
    try {
      const allUsers = await prisma.user.findMany();
      console.log('All users after creation:', allUsers);
    } catch (findUsersError) {
      console.error('Error finding users:', findUsersError);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error; // Re-throw to be caught by the outer catch block
  }
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
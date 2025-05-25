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
    let adminUser;
    try {
      const adminPassword = await bcrypt.hash('Team2025*', 10);
      adminUser = await prisma.user.upsert({
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

    // Create sample form configurations
    console.log('Creating sample form configurations...');
    try {
      const sampleConfigs = [
        {
          name: 'immobilien_standard_2025',
          formType: 'immobilien',
          version: '1.0',
          description: 'Standard real estate form configuration for 2025',
          isActive: true,
          sections: [
            {
              id: 'personal-section',
              sectionType: 'Personal',
              showFields: ['firstName', 'lastName', 'email', 'phone', 'birthDate', 'address'],
              hideFields: [],
              order: 0
            },
            {
              id: 'family-section',
              sectionType: 'Family',
              showFields: ['hasSpouse', 'numberOfChildren'],
              hideFields: [],
              order: 1
            },
            {
              id: 'income-section',
              sectionType: 'Income',
              showFields: ['grossIncome', 'netIncome', 'employmentType'],
              hideFields: [],
              order: 2
            }
          ],
          customFields: [
            {
              id: 'property-type',
              name: 'propertyType',
              label: 'Property Type',
              type: 'select',
              required: true,
              options: ['House', 'Apartment', 'Commercial', 'Land']
            }
          ],
          consentForm: {
            enabled: true,
            customText: 'I consent to the processing of my real estate application data.',
            sections: ['dataProcessing', 'terms']
          },
          documents: [
            {
              id: 'income-proof',
              name: 'Income Proof',
              required: true,
              description: 'Recent salary statements or tax returns'
            }
          ],
          createdById: adminUser?.id || '387b2f0e-218d-46bf-8bf6-8aa3d53acd00'
        },
        {
          name: 'health_insurance_basic',
          formType: 'privateHealthInsurance',
          version: '1.0',
          description: 'Basic private health insurance application form',
          isActive: true,
          sections: [
            {
              id: 'personal-section',
              sectionType: 'Personal',
              showFields: ['firstName', 'lastName', 'email', 'phone', 'birthDate'],
              hideFields: [],
              order: 0
            },
            {
              id: 'employment-section',
              sectionType: 'Employment',
              showFields: ['employmentType', 'occupation', 'employerName'],
              hideFields: [],
              order: 1
            }
          ],
          customFields: [
            {
              id: 'health-conditions',
              name: 'healthConditions',
              label: 'Pre-existing Health Conditions',
              type: 'textarea',
              required: false
            }
          ],
          consentForm: {
            enabled: true,
            customText: 'I consent to health data processing for insurance purposes.',
            sections: ['healthDataProcessing', 'terms']
          },
          documents: [
            {
              id: 'health-records',
              name: 'Health Records',
              required: false,
              description: 'Recent medical examination results'
            }
          ],
          createdById: adminUser?.id || '387b2f0e-218d-46bf-8bf6-8aa3d53acd00'
        }
      ];

      for (const config of sampleConfigs) {
        const result = await prisma.formConfiguration.upsert({
          where: { 
            name_formType: {
              name: config.name,
              formType: config.formType
            }
          },
          update: config,
          create: config
        });
        console.log(`Form configuration "${config.name}" created:`, result.id);
      }
    } catch (configError) {
      console.error('Error creating sample form configurations:', configError);
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
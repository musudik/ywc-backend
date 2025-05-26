import { PrismaClient, PersonalDetails } from '../../../generated/prisma';
import { PersonalDetailsInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PersonalDetailsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async generateNewUserId(): Promise<string> {
    // Create a new User record for the client
    // This is necessary because PersonalDetails has a foreign key to User
    
    // First, get the CLIENT role ID
    const clientRole = await this.prisma.role.findUnique({
      where: { name: 'CLIENT' }
    });
    
    if (!clientRole) {
      throw new Error('CLIENT role not found in database');
    }
    
    // Create a new user record with minimal information
    // The email will be updated when the personal details are saved
    const newUser = await this.prisma.user.create({
      data: {
        email: `temp-${uuidv4()}@placeholder.com`, // Temporary email, will be updated
        password: 'temp-password', // Temporary password, client will need to set their own
        displayName: 'New Client',
        roleId: clientRole.id,
        emailVerified: false
      }
    });
    
    return newUser.id;
  }

  async create(data: PersonalDetailsInput): Promise<PersonalDetails> {
    const { birthDate, ...rest } = data;
    
    return this.prisma.personalDetails.create({
      data: {
        ...rest,
        birthDate: new Date(birthDate),
        userId: rest.userId || rest.coachId
      }
    });
  }

  async upsert(data: PersonalDetailsInput): Promise<PersonalDetails> {
    const { birthDate, ...rest } = data;
    const userId = rest.userId || rest.coachId;
    
    // Use a transaction to ensure both user and personal details are updated consistently
    return this.prisma.$transaction(async (prisma) => {
      // Check if personal details already exist for this user
      const existingPersonalDetails = await prisma.personalDetails.findUnique({
        where: { userId }
      });
      
      // Only update the user's email and display name if this is a new client
      // (i.e., personal details don't exist yet)
      if (!existingPersonalDetails && rest.email) {
        // Check if the user record has a temporary email (indicating it was just created)
        const userRecord = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (userRecord && userRecord.email.startsWith('temp-')) {
          // This is a newly created user record, safe to update with client's email
          await prisma.user.update({
            where: { id: userId },
            data: {
              email: rest.email,
              displayName: `${rest.firstName} ${rest.lastName}`
            }
          });
        }
      }
      
      // Upsert the personal details
      return prisma.personalDetails.upsert({
        where: { userId },
        update: {
          ...rest,
          birthDate: new Date(birthDate)
        },
        create: {
          ...rest,
          birthDate: new Date(birthDate),
          userId
        }
      });
    });
  }

  async findAll(coachId?: string): Promise<PersonalDetails[]> {
    const where = coachId ? { coachId } : {};
    
    return this.prisma.personalDetails.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            email: true,
            displayName: true,
            roleId: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            roleId: true
          }
        },
        employmentDetails: true,
        incomeDetails: true,
        expensesDetails: true,
        assets: true,
        liabilities: true,
        goalsAndWishes: true,
        riskAppetite: true
      }
    });
  }

  async findOne(userId: string): Promise<PersonalDetails | null> {
    return this.prisma.personalDetails.findUnique({
      where: { userId },
      include: {
        coach: {
          select: {
            id: true,
            email: true,
            displayName: true,
            roleId: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            roleId: true
          }
        },
        employmentDetails: true,
        incomeDetails: true,
        expensesDetails: true,
        assets: true,
        liabilities: true,
        goalsAndWishes: true,
        riskAppetite: true
      }
    });
  }

  async update(userId: string, data: Partial<PersonalDetailsInput>): Promise<PersonalDetails> {
    const { birthDate, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (birthDate) {
      updateData.birthDate = new Date(birthDate);
    }
    
    return this.prisma.personalDetails.update({
      where: { userId },
      data: updateData
    });
  }

  async delete(userId: string): Promise<PersonalDetails> {
    return this.prisma.personalDetails.delete({
      where: { userId }
    });
  }
} 
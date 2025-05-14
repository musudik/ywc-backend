import { PrismaClient, PersonalDetails } from '../../../generated/prisma';
import { PersonalDetailsInput } from '../types';

export class PersonalDetailsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
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
        }
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
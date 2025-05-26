import { PrismaClient, Liability } from '../../../generated/prisma';
import { LiabilityInput } from '../types';

export class LiabilityService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: LiabilityInput): Promise<Liability> {
    // Remove auto-generated fields that shouldn't be included in create operations
    const { id, liabilityId, createdAt, updatedAt, ...createData } = data as any;
    
    // Ensure all required fields are present and valid
    if (!createData.personalId) {
      throw new Error('personalId is required');
    }
    
    if (!createData.loanType) {
      throw new Error('loanType is required');
    }
    
    return this.prisma.liability.create({ data: createData });
  }

  async findByPersonalId(personalId: string): Promise<Liability[]> {
    return this.prisma.liability.findMany({
      where: { personalId }
    });
  }

  async findOne(liabilityId: string): Promise<Liability | null> {
    return this.prisma.liability.findUnique({
      where: { liabilityId }
    });
  }

  async update(liabilityId: string, data: Partial<LiabilityInput>): Promise<Liability> {
    return this.prisma.liability.update({
      where: { liabilityId },
      data
    });
  }

  async delete(liabilityId: string): Promise<Liability> {
    return this.prisma.liability.delete({
      where: { liabilityId }
    });
  }
} 
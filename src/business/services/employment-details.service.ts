import { PrismaClient, EmploymentDetails } from '../../../generated/prisma';
import { EmploymentDetailsInput } from '../types';

export class EmploymentDetailsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: EmploymentDetailsInput): Promise<EmploymentDetails> {
    const { employedSince, id, employmentId, createdAt, updatedAt, ...rest } = data as any;
    
    return this.prisma.employmentDetails.create({
      data: {
        ...rest,
        employedSince: new Date(employedSince)
      }
    });
  }

  async findByPersonalId(personalId: string): Promise<EmploymentDetails[]> {
    return this.prisma.employmentDetails.findMany({
      where: { personalId }
    });
  }

  async findOne(employmentId: string): Promise<EmploymentDetails | null> {
    return this.prisma.employmentDetails.findUnique({
      where: { employmentId }
    });
  }

  async update(employmentId: string, data: Partial<EmploymentDetailsInput>): Promise<EmploymentDetails> {
    const { employedSince, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (employedSince) {
      updateData.employedSince = new Date(employedSince);
    }
    
    return this.prisma.employmentDetails.update({
      where: { employmentId },
      data: updateData
    });
  }

  async delete(employmentId: string): Promise<EmploymentDetails> {
    return this.prisma.employmentDetails.delete({
      where: { employmentId }
    });
  }
} 
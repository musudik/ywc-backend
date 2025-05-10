import { PrismaClient, IncomeDetails } from '../../../generated/prisma';
import { IncomeDetailsInput } from '../types';

export class IncomeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: IncomeDetailsInput): Promise<IncomeDetails> {
    return this.prisma.incomeDetails.create({ data });
  }

  async findByPersonalId(personalId: string): Promise<IncomeDetails[]> {
    return this.prisma.incomeDetails.findMany({
      where: { personalId }
    });
  }

  async findOne(incomeId: string): Promise<IncomeDetails | null> {
    return this.prisma.incomeDetails.findUnique({
      where: { incomeId }
    });
  }

  async update(incomeId: string, data: Partial<IncomeDetailsInput>): Promise<IncomeDetails> {
    return this.prisma.incomeDetails.update({
      where: { incomeId },
      data
    });
  }

  async delete(incomeId: string): Promise<IncomeDetails> {
    return this.prisma.incomeDetails.delete({
      where: { incomeId }
    });
  }
} 
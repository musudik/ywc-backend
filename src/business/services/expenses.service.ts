import { PrismaClient, ExpensesDetails } from '../../../generated/prisma';
import { ExpensesDetailsInput } from '../types';

export class ExpensesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ExpensesDetailsInput): Promise<ExpensesDetails> {
    return this.prisma.expensesDetails.create({ data });
  }

  async findByPersonalId(personalId: string): Promise<ExpensesDetails[]> {
    return this.prisma.expensesDetails.findMany({
      where: { personalId }
    });
  }

  async findOne(expensesId: string): Promise<ExpensesDetails | null> {
    return this.prisma.expensesDetails.findUnique({
      where: { expensesId }
    });
  }

  async update(expensesId: string, data: Partial<ExpensesDetailsInput>): Promise<ExpensesDetails> {
    return this.prisma.expensesDetails.update({
      where: { expensesId },
      data
    });
  }

  async delete(expensesId: string): Promise<ExpensesDetails> {
    return this.prisma.expensesDetails.delete({
      where: { expensesId }
    });
  }
} 
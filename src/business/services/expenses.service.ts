import { PrismaClient, ExpensesDetails } from '../../../generated/prisma';
import { ExpensesDetailsInput } from '../types';

export class ExpensesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ExpensesDetailsInput): Promise<ExpensesDetails> {
    // Remove auto-generated fields that shouldn't be included in create operations
    const { id, expensesId, createdAt, updatedAt, ...createData } = data as any;
    return this.prisma.expensesDetails.create({ data: createData });
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
import { PrismaClient, GoalsAndWishes } from '../../../generated/prisma';
import { GoalsAndWishesInput } from '../types';

export class GoalsAndWishesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: GoalsAndWishesInput): Promise<GoalsAndWishes> {
    // Remove auto-generated fields that shouldn't be included in create operations
    const { id, goalsAndWishesId, createdAt, updatedAt, ...createData } = data as any;
    return this.prisma.goalsAndWishes.create({ data: createData });
  }

  async upsert(data: GoalsAndWishesInput): Promise<GoalsAndWishes> {
    // Remove auto-generated fields that shouldn't be included in upsert operations
    const { id, goalsAndWishesId, createdAt, updatedAt, ...upsertData } = data as any;
    
    return this.prisma.goalsAndWishes.upsert({
      where: { personalId: upsertData.personalId },
      update: upsertData,
      create: upsertData
    });
  }

  async findByPersonalId(personalId: string): Promise<GoalsAndWishes | null> {
    return this.prisma.goalsAndWishes.findUnique({
      where: { personalId }
    });
  }

  async findOne(goalsAndWishesId: string): Promise<GoalsAndWishes | null> {
    return this.prisma.goalsAndWishes.findUnique({
      where: { goalsAndWishesId }
    });
  }

  async update(goalsAndWishesId: string, data: Partial<GoalsAndWishesInput>): Promise<GoalsAndWishes> {
    return this.prisma.goalsAndWishes.update({
      where: { goalsAndWishesId },
      data
    });
  }

  async updateByPersonalId(personalId: string, data: Partial<GoalsAndWishesInput>): Promise<GoalsAndWishes> {
    return this.prisma.goalsAndWishes.update({
      where: { personalId },
      data
    });
  }

  async delete(goalsAndWishesId: string): Promise<GoalsAndWishes> {
    return this.prisma.goalsAndWishes.delete({
      where: { goalsAndWishesId }
    });
  }
} 
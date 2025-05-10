import { PrismaClient, GoalsAndWishes } from '../../../generated/prisma';
import { GoalsAndWishesInput } from '../types';

export class GoalsAndWishesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: GoalsAndWishesInput): Promise<GoalsAndWishes> {
    return this.prisma.goalsAndWishes.create({ data });
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
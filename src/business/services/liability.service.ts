import { PrismaClient, Liability } from '../../../generated/prisma';
import { LiabilityInput } from '../types';

export class LiabilityService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: LiabilityInput): Promise<Liability> {
    return this.prisma.liability.create({ data });
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
import { PrismaClient, RiskAppetite } from '../../../generated/prisma';
import { RiskAppetiteInput } from '../types';

export class RiskAppetiteService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: RiskAppetiteInput): Promise<RiskAppetite> {
    return this.prisma.riskAppetite.create({ data });
  }

  async findByPersonalId(personalId: string): Promise<RiskAppetite | null> {
    return this.prisma.riskAppetite.findUnique({
      where: { personalId }
    });
  }

  async findOne(riskAppetiteId: string): Promise<RiskAppetite | null> {
    return this.prisma.riskAppetite.findUnique({
      where: { riskAppetiteId }
    });
  }

  async update(riskAppetiteId: string, data: Partial<RiskAppetiteInput>): Promise<RiskAppetite> {
    return this.prisma.riskAppetite.update({
      where: { riskAppetiteId },
      data
    });
  }

  async updateByPersonalId(personalId: string, data: Partial<RiskAppetiteInput>): Promise<RiskAppetite> {
    return this.prisma.riskAppetite.update({
      where: { personalId },
      data
    });
  }

  async delete(riskAppetiteId: string): Promise<RiskAppetite> {
    return this.prisma.riskAppetite.delete({
      where: { riskAppetiteId }
    });
  }
} 
import { PrismaClient, Asset } from '../../../generated/prisma';
import { AssetInput } from '../types';

export class AssetService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: AssetInput): Promise<Asset> {
    return this.prisma.asset.create({ data });
  }

  async findByPersonalId(personalId: string): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      where: { personalId }
    });
  }

  async findOne(assetId: string): Promise<Asset | null> {
    return this.prisma.asset.findUnique({
      where: { assetId }
    });
  }

  async update(assetId: string, data: Partial<AssetInput>): Promise<Asset> {
    return this.prisma.asset.update({
      where: { assetId },
      data
    });
  }

  async delete(assetId: string): Promise<Asset> {
    return this.prisma.asset.delete({
      where: { assetId }
    });
  }
} 
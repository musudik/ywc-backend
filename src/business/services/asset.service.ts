import { PrismaClient, Asset } from '../../../generated/prisma';
import { AssetInput } from '../types';

export class AssetService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: AssetInput): Promise<Asset> {
    // Remove auto-generated fields that shouldn't be included in create operations
    const { id, assetId, createdAt, updatedAt, ...createData } = data as any;
    
    // Additional safety check - ensure createData is not an array
    if (Array.isArray(createData)) {
      throw new Error('Invalid data format: createData is an array, expected object');
    }
    
    // Ensure all required fields are present and valid
    if (!createData.personalId) {
      throw new Error('personalId is required');
    }
    
    return this.prisma.asset.create({ data: createData });
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
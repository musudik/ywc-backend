import { PrismaClient, CustomForm } from '../../../generated/prisma';
import { CustomFormInput } from '../types';

export class CustomFormService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CustomFormInput): Promise<CustomForm> {
    const { createdDate, updatedDate, ...rest } = data;
    
    return this.prisma.customForm.create({
      data: {
        ...rest,
        createdDate: new Date(createdDate),
        updatedDate: new Date(updatedDate || createdDate)
      }
    });
  }

  async findByPersonalId(personalId: string): Promise<CustomForm[]> {
    return this.prisma.customForm.findMany({
      where: { personalId }
    });
  }

  async findOne(customFormId: string): Promise<CustomForm | null> {
    return this.prisma.customForm.findUnique({
      where: { customFormId }
    });
  }

  async update(customFormId: string, data: Partial<CustomFormInput>): Promise<CustomForm> {
    const { createdDate, updatedDate, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (updatedDate) {
      updateData.updatedDate = new Date(updatedDate);
    }
    if (createdDate) {
      updateData.createdDate = new Date(createdDate);
    }
    
    return this.prisma.customForm.update({
      where: { customFormId },
      data: updateData
    });
  }

  async delete(customFormId: string): Promise<CustomForm> {
    return this.prisma.customForm.delete({
      where: { customFormId }
    });
  }
} 
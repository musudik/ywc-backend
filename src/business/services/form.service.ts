import { PrismaClient, Form } from '../../../generated/prisma';
import { FormInput } from '../types';

export class FormService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: FormInput): Promise<Form> {
    const { createdDate, updatedDate, ...rest } = data;
    
    return this.prisma.form.create({
      data: {
        ...rest,
        createdDate: new Date(createdDate),
        updatedDate: new Date(updatedDate || createdDate)
      }
    });
  }

  async findByPersonalId(personalId: string): Promise<Form[]> {
    return this.prisma.form.findMany({
      where: { personalId }
    });
  }

  async findOne(formId: string): Promise<Form | null> {
    return this.prisma.form.findUnique({
      where: { formId }
    });
  }

  async update(formId: string, data: Partial<FormInput>): Promise<Form> {
    const { createdDate, updatedDate, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (updatedDate) {
      updateData.updatedDate = new Date(updatedDate);
    }
    if (createdDate) {
      updateData.createdDate = new Date(createdDate);
    }
    
    return this.prisma.form.update({
      where: { formId },
      data: updateData
    });
  }

  async delete(formId: string): Promise<Form> {
    return this.prisma.form.delete({
      where: { formId }
    });
  }
} 
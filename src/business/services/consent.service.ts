import { PrismaClient, Consent, ConsentType } from '../../../generated/prisma';
import { ConsentInput } from '../types';

export class ConsentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ConsentInput): Promise<Consent> {
    const { consentDate, ...rest } = data;
    
    return this.prisma.consent.create({
      data: {
        ...rest,
        consentDate: new Date(consentDate)
      }
    });
  }

  async findByPersonalId(personalId: string): Promise<Consent[]> {
    return this.prisma.consent.findMany({
      where: { personalId }
    });
  }

  async findByPersonalIdAndType(personalId: string, consentType: ConsentType): Promise<Consent[]> {
    return this.prisma.consent.findMany({
      where: { 
        personalId,
        consentType
      }
    });
  }

  async findOne(consentId: string): Promise<Consent | null> {
    return this.prisma.consent.findUnique({
      where: { consentId }
    });
  }

  async update(consentId: string, data: Partial<ConsentInput>): Promise<Consent> {
    const { consentDate, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (consentDate) {
      updateData.consentDate = new Date(consentDate);
    }
    
    return this.prisma.consent.update({
      where: { consentId },
      data: updateData
    });
  }

  async delete(consentId: string): Promise<Consent> {
    return this.prisma.consent.delete({
      where: { consentId }
    });
  }
} 
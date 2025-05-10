import { PrismaClient, Document } from '../../../generated/prisma';
import { DocumentInput } from '../types';

export class DocumentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: DocumentInput): Promise<Document> {
    const { documentDate, ...rest } = data;
    
    return this.prisma.document.create({
      data: {
        ...rest,
        documentDate: new Date(documentDate)
      }
    });
  }

  async findByPersonalId(personalId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { personalId }
    });
  }

  async findOne(documentId: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { documentId }
    });
  }

  async update(documentId: string, data: Partial<DocumentInput>): Promise<Document> {
    const { documentDate, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (documentDate) {
      updateData.documentDate = new Date(documentDate);
    }
    
    return this.prisma.document.update({
      where: { documentId },
      data: updateData
    });
  }

  async delete(documentId: string): Promise<Document> {
    return this.prisma.document.delete({
      where: { documentId }
    });
  }
} 
import { PrismaClient } from '../../../generated/prisma';
import {
  IncomeDetailsInput,
  ExpensesDetailsInput,
  AssetInput,
  LiabilityInput,
  GoalsAndWishesInput,
  RiskAppetiteInput,
  ConsentInput,
  DocumentInput,
  FormInput,
  CustomFormInput,
  EmploymentDetailsInput
} from '../types';

export class ClientDataService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Employment Details
  async createEmployment(data: EmploymentDetailsInput) {
    const { employedSince, ...rest } = data;
    
    return this.prisma.employmentDetails.create({
      data: {
        ...rest,
        employedSince: new Date(employedSince)
      }
    });
  }

  async getEmploymentDetails(personalId: string) {
    return this.prisma.employmentDetails.findMany({
      where: { personalId }
    });
  }

  async findEmploymentById(employmentId: string) {
    return this.prisma.employmentDetails.findUnique({
      where: { employmentId }
    });
  }

  async updateEmployment(employmentId: string, data: Partial<EmploymentDetailsInput>) {
    const { employedSince, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (employedSince) {
      updateData.employedSince = new Date(employedSince);
    }
    
    return this.prisma.employmentDetails.update({
      where: { employmentId },
      data: updateData
    });
  }

  async deleteEmployment(employmentId: string) {
    return this.prisma.employmentDetails.delete({
      where: { employmentId }
    });
  }

  // Income Details
  async createIncomeDetails(data: IncomeDetailsInput) {
    return this.prisma.incomeDetails.create({ data });
  }

  async getIncomeDetails(personalId: string) {
    return this.prisma.incomeDetails.findMany({ where: { personalId } });
  }

  async updateIncomeDetails(incomeId: string, data: Partial<IncomeDetailsInput>) {
    return this.prisma.incomeDetails.update({
      where: { incomeId },
      data
    });
  }

  async deleteIncomeDetails(incomeId: string) {
    return this.prisma.incomeDetails.delete({ where: { incomeId } });
  }

  // Expenses Details
  async createExpensesDetails(data: ExpensesDetailsInput) {
    return this.prisma.expensesDetails.create({ data });
  }

  async getExpensesDetails(personalId: string) {
    return this.prisma.expensesDetails.findMany({ where: { personalId } });
  }

  async updateExpensesDetails(expensesId: string, data: Partial<ExpensesDetailsInput>) {
    return this.prisma.expensesDetails.update({
      where: { expensesId },
      data
    });
  }

  async deleteExpensesDetails(expensesId: string) {
    return this.prisma.expensesDetails.delete({ where: { expensesId } });
  }

  // Assets
  async createAsset(data: AssetInput) {
    return this.prisma.asset.create({ data });
  }

  async getAssets(personalId: string) {
    return this.prisma.asset.findMany({ where: { personalId } });
  }

  async updateAsset(assetId: string, data: Partial<AssetInput>) {
    return this.prisma.asset.update({
      where: { assetId },
      data
    });
  }

  async deleteAsset(assetId: string) {
    return this.prisma.asset.delete({ where: { assetId } });
  }

  // Liabilities
  async createLiability(data: LiabilityInput) {
    return this.prisma.liability.create({ data });
  }

  async getLiabilities(personalId: string) {
    return this.prisma.liability.findMany({ where: { personalId } });
  }

  async updateLiability(liabilityId: string, data: Partial<LiabilityInput>) {
    return this.prisma.liability.update({
      where: { liabilityId },
      data
    });
  }

  async deleteLiability(liabilityId: string) {
    return this.prisma.liability.delete({ where: { liabilityId } });
  }

  // Goals and Wishes
  async createGoalsAndWishes(data: GoalsAndWishesInput) {
    return this.prisma.goalsAndWishes.create({ data });
  }

  async getGoalsAndWishes(personalId: string) {
    return this.prisma.goalsAndWishes.findUnique({ where: { personalId } });
  }

  async updateGoalsAndWishes(personalId: string, data: Partial<GoalsAndWishesInput>) {
    return this.prisma.goalsAndWishes.update({
      where: { personalId },
      data
    });
  }

  async deleteGoalsAndWishes(personalId: string) {
    return this.prisma.goalsAndWishes.delete({ where: { personalId } });
  }

  // Risk Appetite
  async createRiskAppetite(data: RiskAppetiteInput) {
    return this.prisma.riskAppetite.create({ data });
  }

  async getRiskAppetite(personalId: string) {
    return this.prisma.riskAppetite.findUnique({ where: { personalId } });
  }

  async updateRiskAppetite(personalId: string, data: Partial<RiskAppetiteInput>) {
    return this.prisma.riskAppetite.update({
      where: { personalId },
      data
    });
  }

  async deleteRiskAppetite(personalId: string) {
    return this.prisma.riskAppetite.delete({ where: { personalId } });
  }

  // Consents
  async createConsent(data: ConsentInput) {
    const { consentDate, ...rest } = data;
    
    return this.prisma.consent.create({
      data: {
        ...rest,
        consentDate: new Date(consentDate)
      }
    });
  }

  async getConsents(personalId: string) {
    return this.prisma.consent.findMany({ where: { personalId } });
  }

  async updateConsent(consentId: string, data: Partial<ConsentInput>) {
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

  async deleteConsent(consentId: string) {
    return this.prisma.consent.delete({ where: { consentId } });
  }

  // Documents
  async createDocument(data: DocumentInput) {
    const { documentDate, ...rest } = data;
    
    return this.prisma.document.create({
      data: {
        ...rest,
        documentDate: new Date(documentDate)
      }
    });
  }

  async getDocuments(personalId: string) {
    return this.prisma.document.findMany({ where: { personalId } });
  }

  async updateDocument(documentId: string, data: Partial<DocumentInput>) {
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

  async deleteDocument(documentId: string) {
    return this.prisma.document.delete({ where: { documentId } });
  }

  // Forms
  async createForm(data: FormInput) {
    const { createdDate, updatedDate, ...rest } = data;
    
    return this.prisma.form.create({
      data: {
        ...rest,
        createdDate: new Date(createdDate),
        updatedDate: new Date(updatedDate || createdDate)
      }
    });
  }

  async getForms(personalId: string) {
    return this.prisma.form.findMany({ where: { personalId } });
  }

  async updateForm(formId: string, data: Partial<FormInput>) {
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

  async deleteForm(formId: string) {
    return this.prisma.form.delete({ where: { formId } });
  }

  // Custom Forms
  async createCustomForm(data: CustomFormInput) {
    const { createdDate, updatedDate, ...rest } = data;
    
    return this.prisma.customForm.create({
      data: {
        ...rest,
        createdDate: new Date(createdDate),
        updatedDate: new Date(updatedDate || createdDate)
      }
    });
  }

  async getCustomForms(personalId: string) {
    return this.prisma.customForm.findMany({ where: { personalId } });
  }

  async updateCustomForm(customFormId: string, data: Partial<CustomFormInput>) {
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

  async deleteCustomForm(customFormId: string) {
    return this.prisma.customForm.delete({ where: { customFormId } });
  }
} 
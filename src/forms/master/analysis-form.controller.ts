import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';
import { Applicant, Child, AnalysisForm, FormStatus } from './types';

const prisma = new PrismaClient();

// Validation schemas
const applicantSchema = z.object({
  type: z.enum(['A', 'B']),
  firstName: z.string(),
  lastName: z.string(),
  streetAddress: z.string(),
  postalCode: z.string(),
  city: z.string(),
  phone: z.string(),
  email: z.string(),
  birthDate: z.string().transform((str: string) => new Date(str)),
  birthPlace: z.string(),
  maritalStatus: z.string(),
  nationality: z.string(),
  housing: z.string(),
  occupation: z.string(),
  contractType: z.string(),
  grossIncome: z.number(),
  netIncome: z.number(),
  taxClass: z.string(),
  taxId: z.string(),
  numberOfSalaries: z.number(),
  childBenefit: z.number(),
  otherIncome: z.number(),
  salaryProofAttached: z.boolean(),
  incomeTradeBusiness: z.number(),
  incomeSelfEmployedWork: z.number(),
  incomeSideJob: z.number(),
  realEstate: z.number(),
  securities: z.number(),
  bankDeposits: z.number(),
  buildingSavings: z.number(),
  insuranceValues: z.number(),
  otherAssets: z.number(),
  realEstateLoans: z.number(),
  otherLoans: z.number(),
  leasingObligations: z.number(),
  otherLiabilities: z.number(),
  retirementPlanning: z.string(),
  capitalFormation: z.string(),
  realEstateGoals: z.string(),
  financing: z.string(),
  protection: z.string(),
  healthcareProvision: z.string(),
  otherGoals: z.string(),
  riskAppetite: z.string(),
  investmentHorizon: z.string(),
  knowledgeExperience: z.string(),
  healthInsurance: z.string(),
  healthInsuranceNumber: z.string(),
  healthInsuranceProof: z.string(),
});

const childSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string().transform((str: string) => new Date(str)),
  birthPlace: z.string(),
  nationality: z.string(),
});

const analysisFormSchema = z.object({
  consultantName: z.string(),
  officeLocation: z.string(),
  analysisDate: z.string().transform((str: string) => new Date(str)),
  coldRent: z.number(),
  gas: z.number(),
  electricity: z.number(),
  telecommunication: z.number(),
  subscriptions: z.number(),
  accountMaintenanceFee: z.number(),
  livingExpenses: z.number(),
  alimony: z.number(),
  otherExpenses: z.number(),
  addLoanOrLeasing: z.boolean(),
  loanBank: z.string().optional(),
  loanAmount: z.number().optional(),
  loanMonthlyRate: z.number().optional(),
  loanInterest: z.number().optional(),
  analysisConsent: z.boolean(),
  analysisConsentText: z.string(),
  analysisConsentSignature: z.string(),
  analysisLocation: z.string(),
  analysisConsentDate: z.string().transform((str: string) => new Date(str)),
  applicants: z.array(applicantSchema),
  children: z.array(childSchema).optional(),
});

export class AnalysisFormController {
  // Create a new analysis form
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = analysisFormSchema.parse(req.body);

      const analysisForm = await prisma.analysisForm.create({
        data: {
          userId,
          consultantName: validatedData.consultantName,
          officeLocation: validatedData.officeLocation,
          analysisDate: validatedData.analysisDate,
          coldRent: validatedData.coldRent,
          gas: validatedData.gas,
          electricity: validatedData.electricity,
          telecommunication: validatedData.telecommunication,
          subscriptions: validatedData.subscriptions,
          accountMaintenanceFee: validatedData.accountMaintenanceFee,
          livingExpenses: validatedData.livingExpenses,
          alimony: validatedData.alimony,
          otherExpenses: validatedData.otherExpenses,
          addLoanOrLeasing: validatedData.addLoanOrLeasing,
          loanBank: validatedData.loanBank,
          loanAmount: validatedData.loanAmount,
          loanMonthlyRate: validatedData.loanMonthlyRate,
          loanInterest: validatedData.loanInterest,
          analysisConsent: validatedData.analysisConsent,
          analysisConsentText: validatedData.analysisConsentText,
          analysisConsentSignature: validatedData.analysisConsentSignature,
          analysisLocation: validatedData.analysisLocation,
          analysisConsentDate: validatedData.analysisConsentDate,
          applicants: {
            create: validatedData.applicants.map((applicant: Applicant) => ({
              type: applicant.type,
              firstName: applicant.firstName,
              lastName: applicant.lastName,
              streetAddress: applicant.streetAddress,
              postalCode: applicant.postalCode,
              city: applicant.city,
              phone: applicant.phone,
              email: applicant.email,
              birthDate: applicant.birthDate,
              birthPlace: applicant.birthPlace,
              maritalStatus: applicant.maritalStatus,
              nationality: applicant.nationality,
              housing: applicant.housing,
              occupation: applicant.occupation,
              contractType: applicant.contractType,
              grossIncome: applicant.grossIncome,
              netIncome: applicant.netIncome,
              taxClass: applicant.taxClass,
              taxId: applicant.taxId,
              numberOfSalaries: applicant.numberOfSalaries,
              childBenefit: applicant.childBenefit,
              otherIncome: applicant.otherIncome,
              salaryProofAttached: applicant.salaryProofAttached,
              incomeTradeBusiness: applicant.incomeTradeBusiness,
              incomeSelfEmployedWork: applicant.incomeSelfEmployedWork,
              incomeSideJob: applicant.incomeSideJob,
              realEstate: applicant.realEstate,
              securities: applicant.securities,
              bankDeposits: applicant.bankDeposits,
              buildingSavings: applicant.buildingSavings,
              insuranceValues: applicant.insuranceValues,
              otherAssets: applicant.otherAssets,
              realEstateLoans: applicant.realEstateLoans,
              otherLoans: applicant.otherLoans,
              leasingObligations: applicant.leasingObligations,
              otherLiabilities: applicant.otherLiabilities,
              retirementPlanning: applicant.retirementPlanning,
              capitalFormation: applicant.capitalFormation,
              realEstateGoals: applicant.realEstateGoals,
              financing: applicant.financing,
              protection: applicant.protection,
              healthcareProvision: applicant.healthcareProvision,
              otherGoals: applicant.otherGoals,
              riskAppetite: applicant.riskAppetite,
              investmentHorizon: applicant.investmentHorizon,
              knowledgeExperience: applicant.knowledgeExperience,
              healthInsurance: applicant.healthInsurance,
              healthInsuranceNumber: applicant.healthInsuranceNumber,
              healthInsuranceProof: applicant.healthInsuranceProof,
            })),
          },
          children: {
            create: validatedData.children?.map((child: Child) => ({
              firstName: child.firstName,
              lastName: child.lastName,
              birthDate: child.birthDate,
              birthPlace: child.birthPlace,
              nationality: child.nationality,
            })) || [],
          },
        },
        include: {
          applicants: true,
          children: true,
        },
      });

      return res.status(201).json(analysisForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error creating analysis form:', error);
      return res.status(500).json({ message: 'Failed to create analysis form' });
    }
  }

  // Get all analysis forms for the current user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const analysisForms = await prisma.analysisForm.findMany({
        where: { userId },
        include: {
          applicants: true,
          children: true,
        },
      });

      return res.json(analysisForms);
    } catch (error) {
      console.error('Error fetching analysis forms:', error);
      return res.status(500).json({ message: 'Failed to fetch analysis forms' });
    }
  }

  // Get a specific analysis form
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const analysisForm = await prisma.analysisForm.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          applicants: true,
          children: true,
        },
      });

      if (!analysisForm) {
        return res.status(404).json({ message: 'Analysis form not found' });
      }

      return res.json(analysisForm);
    } catch (error) {
      console.error('Error fetching analysis form:', error);
      return res.status(500).json({ message: 'Failed to fetch analysis form' });
    }
  }

  // Update an analysis form
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = analysisFormSchema.parse(req.body);

      // Check if form exists and belongs to user
      const existingForm = await prisma.analysisForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ message: 'Analysis form not found' });
      }

      // Update the form and related data
      const updatedForm = await prisma.analysisForm.update({
        where: { id },
        data: {
          consultantName: validatedData.consultantName,
          officeLocation: validatedData.officeLocation,
          analysisDate: validatedData.analysisDate,
          coldRent: validatedData.coldRent,
          gas: validatedData.gas,
          electricity: validatedData.electricity,
          telecommunication: validatedData.telecommunication,
          subscriptions: validatedData.subscriptions,
          accountMaintenanceFee: validatedData.accountMaintenanceFee,
          livingExpenses: validatedData.livingExpenses,
          alimony: validatedData.alimony,
          otherExpenses: validatedData.otherExpenses,
          addLoanOrLeasing: validatedData.addLoanOrLeasing,
          loanBank: validatedData.loanBank,
          loanAmount: validatedData.loanAmount,
          loanMonthlyRate: validatedData.loanMonthlyRate,
          loanInterest: validatedData.loanInterest,
          analysisConsent: validatedData.analysisConsent,
          analysisConsentText: validatedData.analysisConsentText,
          analysisConsentSignature: validatedData.analysisConsentSignature,
          analysisLocation: validatedData.analysisLocation,
          analysisConsentDate: validatedData.analysisConsentDate,
          // Update applicants
          applicants: {
            deleteMany: {},
            create: validatedData.applicants.map((applicant: Applicant) => ({
              type: applicant.type,
              firstName: applicant.firstName,
              lastName: applicant.lastName,
              streetAddress: applicant.streetAddress,
              postalCode: applicant.postalCode,
              city: applicant.city,
              phone: applicant.phone,
              email: applicant.email,
              birthDate: applicant.birthDate,
              birthPlace: applicant.birthPlace,
              maritalStatus: applicant.maritalStatus,
              nationality: applicant.nationality,
              housing: applicant.housing,
              occupation: applicant.occupation,
              contractType: applicant.contractType,
              grossIncome: applicant.grossIncome,
              netIncome: applicant.netIncome,
              taxClass: applicant.taxClass,
              taxId: applicant.taxId,
              numberOfSalaries: applicant.numberOfSalaries,
              childBenefit: applicant.childBenefit,
              otherIncome: applicant.otherIncome,
              salaryProofAttached: applicant.salaryProofAttached,
              incomeTradeBusiness: applicant.incomeTradeBusiness,
              incomeSelfEmployedWork: applicant.incomeSelfEmployedWork,
              incomeSideJob: applicant.incomeSideJob,
              realEstate: applicant.realEstate,
              securities: applicant.securities,
              bankDeposits: applicant.bankDeposits,
              buildingSavings: applicant.buildingSavings,
              insuranceValues: applicant.insuranceValues,
              otherAssets: applicant.otherAssets,
              realEstateLoans: applicant.realEstateLoans,
              otherLoans: applicant.otherLoans,
              leasingObligations: applicant.leasingObligations,
              otherLiabilities: applicant.otherLiabilities,
              retirementPlanning: applicant.retirementPlanning,
              capitalFormation: applicant.capitalFormation,
              realEstateGoals: applicant.realEstateGoals,
              financing: applicant.financing,
              protection: applicant.protection,
              healthcareProvision: applicant.healthcareProvision,
              otherGoals: applicant.otherGoals,
              riskAppetite: applicant.riskAppetite,
              investmentHorizon: applicant.investmentHorizon,
              knowledgeExperience: applicant.knowledgeExperience,
              healthInsurance: applicant.healthInsurance,
              healthInsuranceNumber: applicant.healthInsuranceNumber,
              healthInsuranceProof: applicant.healthInsuranceProof,
            })),
          },
          // Update children
          children: {
            deleteMany: {},
            create: validatedData.children?.map((child: Child) => ({
              firstName: child.firstName,
              lastName: child.lastName,
              birthDate: child.birthDate,
              birthPlace: child.birthPlace,
              nationality: child.nationality,
            })) || [],
          },
        },
        include: {
          applicants: true,
          children: true,
        },
      });

      return res.json(updatedForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error updating analysis form:', error);
      return res.status(500).json({ message: 'Failed to update analysis form' });
    }
  }

  // Delete an analysis form
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if form exists and belongs to user
      const existingForm = await prisma.analysisForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ message: 'Analysis form not found' });
      }

      // Delete the form (cascade will handle related records)
      await prisma.analysisForm.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting analysis form:', error);
      return res.status(500).json({ message: 'Failed to delete analysis form' });
    }
  }

  // Update form status
  async updateStatus(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const { status } = req.body as { status: FormStatus };

      if (!['No-Form', 'Submitted', 'Pending', 'Approved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Check if form exists and belongs to user
      const existingForm = await prisma.analysisForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ message: 'Analysis form not found' });
      }

      const updatedForm = await prisma.analysisForm.update({
        where: { id },
        data: { status },
        include: {
          applicants: true,
          children: true,
        },
      });

      return res.json(updatedForm);
    } catch (error) {
      console.error('Error updating form status:', error);
      return res.status(500).json({ message: 'Failed to update form status' });
    }
  }
} 
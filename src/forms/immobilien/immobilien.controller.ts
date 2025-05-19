import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Personal Details validation schema
const personalDetailsSchema = z.object({
  coachId: z.string(),
  applicantType: z.enum(['PrimaryApplicant', 'SecondaryApplicant']),
  firstName: z.string(),
  lastName: z.string(),
  streetAddress: z.string(),
  postalCode: z.string(),
  city: z.string(),
  phone: z.string(),
  email: z.string().email(),
  birthDate: z.string().or(z.date()),
  birthPlace: z.string(),
  maritalStatus: z.string(),
  nationality: z.string(),
  housing: z.string()
});

// Employment Details validation schema
const employmentDetailsSchema = z.object({
  personalId: z.string(),
  employmentType: z.enum(["employed", "selfEmployed", "unemployed", "retired", "student", "other"]),
  occupation: z.string(),
  contractType: z.string(),
  contractDuration: z.string(),
  employerName: z.string(),
  employedSince: z.string().or(z.date())
});

// Function to normalize employment type values to match validation schema
function normalizeEmploymentType(value: string): string {
  // Handle case conversions
  if (typeof value !== 'string') return 'employed';
  
  const lowercasedValue = value.toLowerCase();
  
  // Map capitalized/pascal case to the expected lowercase format
  const mappings: Record<string, string> = {
    'employed': 'employed',
    'selfemployed': 'selfEmployed',
    'unemployed': 'unemployed',
    'retired': 'retired',
    'student': 'student',
    'other': 'other',
  };
  
  // Remove spaces, hyphens, and underscores for more flexible matching
  const normalized = lowercasedValue.replace(/[\s\-_]/g, '');
  return mappings[normalized] || 'employed'; // Default to employed if no match
}

// Function to map employment type to database enum
const mapEmploymentType = (type: string): any => {
  // If you find that one approach works better than the other,
  // you can remove the one that doesn't work
  
  // Approach 1: Use string values that match the database enum
  const oldMapping: Record<string, string> = {
    'employed': 'Employed',
    'selfEmployed': 'SelfEmployed',
    'unemployed': 'Unemployed',
    'retired': 'Retired',
    'student': 'Student',
    'other': 'Other'
  };
  
  // Approach 2: Try the new values if the database has been updated
  const newMapping: Record<string, string> = {
    'employed': 'Employed',
    'selfEmployed': 'SelfEmployed',
    'unemployed': 'Unemployed',
    'retired': 'Retired',
    'student': 'Student',
    'other': 'Other'
  };
  
  // If your database was successfully updated to the new values, use this return:
  // return newMapping[type];
  
  // If your database still has the old values, use this return:
  return oldMapping[type];
};

// Modified raw query function for creating employment details with direct SQL
// Use this as a fallback if the Prisma approach doesn't work
async function createEmploymentDetailsRaw(data: any) {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO employment_details (
        "personalId", 
        "employmentType", 
        "occupation", 
        "contractType", 
        "contractDuration", 
        "employerName", 
        "employedSince",
        "employmentId",
        "createdAt",
        "updatedAt",
        "id"
      ) 
      VALUES (
        ${data.personalId},
        ${data.employmentType}::text::"EmploymentType",
        ${data.occupation},
        ${data.contractType},
        ${data.contractDuration},
        ${data.employerName},
        ${data.employedSince},
        gen_random_uuid(),
        NOW(),
        NOW(),
        gen_random_uuid()
      )
      RETURNING *;
    `;
    return result;
  } catch (error) {
    console.error('Error in raw query:', error);
    
    // If gen_random_uuid also fails, try with a simpler approach
    try {
      // Use a simple fallback that generates UUIDs at the app level instead of DB level
      const employmentId = crypto.randomUUID();
      const id = crypto.randomUUID();
      
      const fallbackResult = await prisma.$queryRaw`
        INSERT INTO employment_details (
          "personalId", 
          "employmentType", 
          "occupation", 
          "contractType", 
          "contractDuration", 
          "employerName", 
          "employedSince",
          "employmentId",
          "createdAt",
          "updatedAt",
          "id"
        ) 
        VALUES (
          ${data.personalId},
          ${data.employmentType}::text::"EmploymentType",
          ${data.occupation},
          ${data.contractType},
          ${data.contractDuration},
          ${data.employerName},
          ${data.employedSince},
          ${employmentId},
          NOW(),
          NOW(),
          ${id}
        )
        RETURNING *;
      `;
      return fallbackResult;
    } catch (fallbackError) {
      console.error('Error in fallback query:', fallbackError);
      throw fallbackError;
    }
  }
}

// Income Details validation schema
const incomeDetailsSchema = z.object({
  personalId: z.string(),
  grossIncome: z.string().or(z.number()),
  netIncome: z.string().or(z.number()),
  taxClass: z.string(),
  taxId: z.string(),
  numberOfSalaries: z.string().or(z.number()),
  childBenefit: z.string().or(z.number()),
  otherIncome: z.string().or(z.number()),
  incomeTradeBusiness: z.string().or(z.number()),
  incomeSelfEmployedWork: z.string().or(z.number()),
  incomeSideJob: z.string().or(z.number())
});

// Expenses Details validation schema
const expensesDetailsSchema = z.object({
  personalId: z.string(),
  coldRent: z.string().or(z.number()),
  electricity: z.string().or(z.number()),
  livingExpenses: z.string().or(z.number()),
  gas: z.string().or(z.number()),
  telecommunication: z.string().or(z.number()),
  accountMaintenanceFee: z.string().or(z.number()),
  alimony: z.string().or(z.number()),
  subscriptions: z.string().or(z.number()),
  otherExpenses: z.string().or(z.number())
});

// Asset validation schema
const assetSchema = z.object({
  personalId: z.string(),
  realEstate: z.string().or(z.number()),
  securities: z.string().or(z.number()),
  bankDeposits: z.string().or(z.number()),
  buildingSavings: z.string().or(z.number()),
  insuranceValues: z.string().or(z.number()),
  otherAssets: z.string().or(z.number())
});

// Liability validation schema
const liabilitySchema = z.object({
  personalId: z.string(),
  loanType: z.string(),
  loanBank: z.string().optional(),
  loanAmount: z.number().optional(),
  loanMonthlyRate: z.number().optional(),
  loanInterest: z.number().optional()
});

// Function to normalize loan type to a valid enum value
function normalizeLoanType(type: string): 'PersonalLoan' | 'HomeLoan' | 'CarLoan' | 'BusinessLoan' | 'EducationLoan' | 'OtherLoan' {
  if (!type || type.trim() === '') {
    return 'OtherLoan'; // Default value for empty strings
  }
  
  const normalizedType = type.replace(/\s+/g, '').toLowerCase();
  
  const loanTypeMap: Record<string, 'PersonalLoan' | 'HomeLoan' | 'CarLoan' | 'BusinessLoan' | 'EducationLoan' | 'OtherLoan'> = {
    'personal': 'PersonalLoan',
    'personalloan': 'PersonalLoan',
    'home': 'HomeLoan',
    'homeloan': 'HomeLoan',
    'mortgage': 'HomeLoan',
    'car': 'CarLoan',
    'carloan': 'CarLoan',
    'auto': 'CarLoan',
    'autoloan': 'CarLoan',
    'business': 'BusinessLoan',
    'businessloan': 'BusinessLoan',
    'education': 'EducationLoan',
    'educationloan': 'EducationLoan',
    'student': 'EducationLoan',
    'studentloan': 'EducationLoan'
  };
  
  return loanTypeMap[normalizedType] || 'OtherLoan';
}

// Consent validation schema
const consentSchema = z.object({
  personalId: z.string().optional(),
  consentType: z.enum(['Analysis', 'Immobillion', 'PrivateHealthInsurance', 'StateHealthInsurance', 'KFZ', 'Electricity', 'Loans', 'Sanuspay', 'Gems', 'Other']).optional(),
  consent: z.boolean().optional(),
  consentText: z.string().optional(),
  consentSignature: z.string().optional(),
  consentDate: z.string().or(z.date()).optional(),
  location: z.string().optional()
});

// Document validation schema
const documentSchema = z.object({
  personalId: z.string().optional(),
  documentName: z.string().optional(),
  documentLocation: z.string().optional(),
  documentDate: z.string().or(z.date()).optional()
}).optional();

// Main form validation schema
const immobilienFormSchema = z.object({
  personal: personalDetailsSchema,
  employment: employmentDetailsSchema,
  income: incomeDetailsSchema,
  expenses: expensesDetailsSchema,
  assets: assetSchema,
  liabilities: liabilitySchema,
  consent: consentSchema,
  formType: z.string(),
  submittedAt: z.string().or(z.date()),
  userId: z.string()
});

export class ImmobilienController {
  // Create a new immobilien form
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Normalize employment type before validation
      if (req.body.employment && req.body.employment.employmentType) {
        req.body.employment.employmentType = normalizeEmploymentType(req.body.employment.employmentType);
      }

      // Validate the submitted form data
      const validatedData = immobilienFormSchema.parse(req.body);

      // Create the immobilien form
      const immobilienForm = await prisma.immobillionForm.create({
        data: {
          userId,
          status: 'Submitted',
          formType: 'IMMOBILLION',
          formVersion: '1.0'
        }
      });

      // Create or update personal details
      let personalDetails = await prisma.personalDetails.findUnique({
        where: { userId: validatedData.userId }
      });

      if (!personalDetails) {
        personalDetails = await prisma.personalDetails.create({
          data: {
            userId: validatedData.userId,
            coachId: validatedData.personal.coachId,
            applicantType: validatedData.personal.applicantType,
            firstName: validatedData.personal.firstName,
            lastName: validatedData.personal.lastName,
            streetAddress: validatedData.personal.streetAddress,
            postalCode: validatedData.personal.postalCode,
            city: validatedData.personal.city,
            phone: validatedData.personal.phone,
            email: validatedData.personal.email,
            birthDate: new Date(validatedData.personal.birthDate),
            birthPlace: validatedData.personal.birthPlace,
            maritalStatus: validatedData.personal.maritalStatus,
            nationality: validatedData.personal.nationality,
            housing: validatedData.personal.housing
          }
        });
      }

      // Create employment details (with fallback)
      let employmentDetails;
      try {
        // Try the regular Prisma approach first
        employmentDetails = await prisma.employmentDetails.create({
          data: {
            personalId: validatedData.employment.personalId,
            employmentType: mapEmploymentType(validatedData.employment.employmentType) as any,
            occupation: validatedData.employment.occupation,
            contractType: validatedData.employment.contractType,
            contractDuration: validatedData.employment.contractDuration,
            employerName: validatedData.employment.employerName,
            employedSince: new Date(validatedData.employment.employedSince)
          }
        });
      } catch (error) {
        console.log('Falling back to raw query for employment details', error);
        // If that fails, try the raw query approach
        employmentDetails = await createEmploymentDetailsRaw({
          personalId: validatedData.employment.personalId,
          employmentType: mapEmploymentType(validatedData.employment.employmentType),
          occupation: validatedData.employment.occupation,
          contractType: validatedData.employment.contractType,
          contractDuration: validatedData.employment.contractDuration,
          employerName: validatedData.employment.employerName,
          employedSince: new Date(validatedData.employment.employedSince)
        });
      }

      // Create income details
      const incomeDetails = await prisma.incomeDetails.create({
        data: {
          personalId: validatedData.income.personalId,
          grossIncome: typeof validatedData.income.grossIncome === 'string' ? parseFloat(validatedData.income.grossIncome) : validatedData.income.grossIncome,
          netIncome: typeof validatedData.income.netIncome === 'string' ? parseFloat(validatedData.income.netIncome) : validatedData.income.netIncome,
          taxClass: validatedData.income.taxClass,
          taxId: validatedData.income.taxId,
          numberOfSalaries: typeof validatedData.income.numberOfSalaries === 'string' ? parseInt(validatedData.income.numberOfSalaries) : validatedData.income.numberOfSalaries,
          childBenefit: typeof validatedData.income.childBenefit === 'string' ? parseFloat(validatedData.income.childBenefit) : validatedData.income.childBenefit,
          otherIncome: typeof validatedData.income.otherIncome === 'string' ? parseFloat(validatedData.income.otherIncome) : validatedData.income.otherIncome,
          incomeTradeBusiness: typeof validatedData.income.incomeTradeBusiness === 'string' ? parseFloat(validatedData.income.incomeTradeBusiness) : validatedData.income.incomeTradeBusiness,
          incomeSelfEmployedWork: typeof validatedData.income.incomeSelfEmployedWork === 'string' ? parseFloat(validatedData.income.incomeSelfEmployedWork) : validatedData.income.incomeSelfEmployedWork,
          incomeSideJob: typeof validatedData.income.incomeSideJob === 'string' ? parseFloat(validatedData.income.incomeSideJob) : validatedData.income.incomeSideJob
        }
      });

      // Create expenses details
      const expensesDetails = await prisma.expensesDetails.create({
        data: {
          personalId: validatedData.expenses.personalId,
          coldRent: typeof validatedData.expenses.coldRent === 'string' ? parseFloat(validatedData.expenses.coldRent) : validatedData.expenses.coldRent,
          electricity: typeof validatedData.expenses.electricity === 'string' ? parseFloat(validatedData.expenses.electricity) : validatedData.expenses.electricity,
          livingExpenses: typeof validatedData.expenses.livingExpenses === 'string' ? parseFloat(validatedData.expenses.livingExpenses) : validatedData.expenses.livingExpenses,
          gas: typeof validatedData.expenses.gas === 'string' ? parseFloat(validatedData.expenses.gas) : validatedData.expenses.gas,
          telecommunication: typeof validatedData.expenses.telecommunication === 'string' ? parseFloat(validatedData.expenses.telecommunication) : validatedData.expenses.telecommunication,
          accountMaintenanceFee: typeof validatedData.expenses.accountMaintenanceFee === 'string' ? parseFloat(validatedData.expenses.accountMaintenanceFee) : validatedData.expenses.accountMaintenanceFee,
          alimony: typeof validatedData.expenses.alimony === 'string' ? parseFloat(validatedData.expenses.alimony) : validatedData.expenses.alimony,
          subscriptions: typeof validatedData.expenses.subscriptions === 'string' ? parseFloat(validatedData.expenses.subscriptions) : validatedData.expenses.subscriptions,
          otherExpenses: typeof validatedData.expenses.otherExpenses === 'string' ? parseFloat(validatedData.expenses.otherExpenses) : validatedData.expenses.otherExpenses
        }
      });

      // Create asset details
      const asset = await prisma.asset.create({
        data: {
          personalId: validatedData.assets.personalId,
          realEstate: typeof validatedData.assets.realEstate === 'string' ? parseFloat(validatedData.assets.realEstate) : validatedData.assets.realEstate,
          securities: typeof validatedData.assets.securities === 'string' ? parseFloat(validatedData.assets.securities) : validatedData.assets.securities,
          bankDeposits: typeof validatedData.assets.bankDeposits === 'string' ? parseFloat(validatedData.assets.bankDeposits) : validatedData.assets.bankDeposits,
          buildingSavings: typeof validatedData.assets.buildingSavings === 'string' ? parseFloat(validatedData.assets.buildingSavings) : validatedData.assets.buildingSavings,
          insuranceValues: typeof validatedData.assets.insuranceValues === 'string' ? parseFloat(validatedData.assets.insuranceValues) : validatedData.assets.insuranceValues,
          otherAssets: typeof validatedData.assets.otherAssets === 'string' ? parseFloat(validatedData.assets.otherAssets) : validatedData.assets.otherAssets
        }
      });

      // Create liability details
      const liability = await prisma.liability.create({
        data: {
          personalId: validatedData.liabilities.personalId,
          loanType: normalizeLoanType(validatedData.liabilities.loanType),
          loanBank: validatedData.liabilities.loanBank,
          loanAmount: validatedData.liabilities.loanAmount,
          loanMonthlyRate: validatedData.liabilities.loanMonthlyRate,
          loanInterest: validatedData.liabilities.loanInterest
        }
      });

      // Create consent if provided
      let consent = null;
      if (validatedData.consent && validatedData.consent.personalId) {
        consent = await prisma.consent.create({
          data: {
            personalId: validatedData.consent.personalId,
            consentType: validatedData.consent.consentType as any || 'Immobillion',
            consent: validatedData.consent.consent || true,
            consentText: validatedData.consent.consentText || '',
            consentSignature: validatedData.consent.consentSignature || '',
            consentDate: validatedData.consent.consentDate ? new Date(validatedData.consent.consentDate) : new Date(),
            location: validatedData.consent.location || ''
          }
        });
      }

      // Create form entry
      const form = await prisma.form.create({
        data: {
          personalId: validatedData.userId,
          formType: 'Immobillion',
          formName: 'Immobilien Form',
          formLink: `/api/forms/immobilien/${immobilienForm.id}`,
          createdDate: new Date(validatedData.submittedAt),
          updatedDate: new Date()
        }
      });

      return res.status(201).json({
        success: true,
        formId: immobilienForm.id,
        message: 'Immobilien form submitted successfully',
        data: {
          immobilienForm,
          personalDetails,
          employmentDetails,
          incomeDetails,
          expensesDetails,
          asset,
          liability,
          consent,
          form
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Error creating immobilien form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create immobilien form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all immobilien forms for the current user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const immobilienForms = await prisma.immobillionForm.findMany({
        where: { userId },
      });

      // Get associated forms data
      const formData = await Promise.all(
        immobilienForms.map(async (form) => {
          const personalDetails = await prisma.personalDetails.findUnique({
            where: { userId: form.userId },
            include: {
              employmentDetails: true,
              incomeDetails: true,
              expensesDetails: true,
              assets: true,
              liabilities: true,
              consents: {
                where: { consentType: 'Immobillion' }
              },
              forms: {
                where: { formType: 'Immobillion' }
              }
            }
          });

          return {
            ...form,
            personalDetails
          };
        })
      );

      return res.json(formData);
    } catch (error) {
      console.error('Error fetching immobilien forms:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch immobilien forms',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get a specific immobilien form
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const immobilienForm = await prisma.immobillionForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!immobilienForm) {
        return res.status(404).json({ message: 'Immobilien form not found' });
      }

      // Get associated data
      const personalDetails = await prisma.personalDetails.findUnique({
        where: { userId: immobilienForm.userId },
        include: {
          employmentDetails: true,
          incomeDetails: true,
          expensesDetails: true,
          assets: true,
          liabilities: true,
          consents: {
            where: { consentType: 'Immobillion' }
          },
          forms: {
            where: { formType: 'Immobillion' }
          }
        }
      });

      return res.json({
        ...immobilienForm,
        personalDetails
      });
    } catch (error) {
      console.error('Error fetching immobilien form:', error);
      return res.status(500).json({ message: 'Failed to fetch immobilien form' });
    }
  }

  // Update an immobilien form
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = immobilienFormSchema.parse(req.body);

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.immobillionForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Immobilien form not found' 
        });
      }

      // Update the immobilien form
      const immobilienForm = await prisma.immobillionForm.update({
        where: { id },
        data: {
          status: 'Submitted',
          formType: 'IMMOBILLION',
          formVersion: '1.0'
        }
      });

      // Update personal details
      let personalDetails = await prisma.personalDetails.findUnique({
        where: { userId: validatedData.userId }
      });

      if (personalDetails) {
        personalDetails = await prisma.personalDetails.update({
          where: { userId: validatedData.userId },
          data: {
            coachId: validatedData.personal.coachId,
            applicantType: validatedData.personal.applicantType,
            firstName: validatedData.personal.firstName,
            lastName: validatedData.personal.lastName,
            streetAddress: validatedData.personal.streetAddress,
            postalCode: validatedData.personal.postalCode,
            city: validatedData.personal.city,
            phone: validatedData.personal.phone,
            email: validatedData.personal.email,
            birthDate: new Date(validatedData.personal.birthDate),
            birthPlace: validatedData.personal.birthPlace,
            maritalStatus: validatedData.personal.maritalStatus,
            nationality: validatedData.personal.nationality,
            housing: validatedData.personal.housing
          }
        });
      }

      // Update other related data (employment, income, expenses, assets, liabilities)
      // For brevity, just showing a sample of updating employment details
      // You would need to implement similar logic for other related data

      // Get existing employment details
      const existingEmploymentDetails = await prisma.employmentDetails.findFirst({
        where: { personalId: validatedData.employment.personalId }
      });

      if (existingEmploymentDetails) {
        await prisma.employmentDetails.update({
          where: { id: existingEmploymentDetails.id },
          data: {
            employmentType: mapEmploymentType(validatedData.employment.employmentType) as any,
            occupation: validatedData.employment.occupation,
            contractType: validatedData.employment.contractType,
            contractDuration: validatedData.employment.contractDuration,
            employerName: validatedData.employment.employerName,
            employedSince: new Date(validatedData.employment.employedSince)
          }
        });
      }

      // Update form entry
      const existingFormEntry = await prisma.form.findFirst({
        where: { 
          personalId: validatedData.userId,
          formType: 'Immobillion'
        }
      });

      if (existingFormEntry) {
        await prisma.form.update({
          where: { id: existingFormEntry.id },
          data: {
            updatedDate: new Date()
          }
        });
      }

      return res.json({
        success: true,
        formId: immobilienForm.id,
        message: 'Immobilien form updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error updating immobilien form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update immobilien form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete an immobilien form
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.immobillionForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Immobilien form not found' 
        });
      }

      // Delete associated form entries first (due to foreign key constraints)
      await prisma.form.deleteMany({
        where: { 
          personalId: userId,
          formType: 'Immobillion',
          formLink: {
            contains: id
          }
        }
      });

      // Delete the immobilien form
      await prisma.immobillionForm.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Immobilien form deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting immobilien form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete immobilien form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      const { status } = req.body;

      // Validate status
      if (!['No-Form', 'Submitted', 'Pending', 'Approved'].includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid status value' 
        });
      }

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.immobillionForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Immobilien form not found' 
        });
      }

      const updatedForm = await prisma.immobillionForm.update({
        where: { id },
        data: { status },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'Immobilien form status updated successfully',
      });
    } catch (error) {
      console.error('Error updating immobilien form status:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update immobilien form status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 
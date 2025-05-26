import { Request, Response } from 'express';
import { 
  PersonalDetailsService,
  EmploymentDetailsService,
  IncomeService,
  ExpensesService,
  AssetService,
  LiabilityService,
  GoalsAndWishesService,
  RiskAppetiteService,
  ConsentService,
  DocumentService,
  FormService,
  CustomFormService
} from '../services';
import { z } from 'zod';

// Employment Details validation schema
const employmentDetailsSchema = z.object({
  personalId: z.string(),
  employmentType: z.enum(["Employed", "SelfEmployed", "Unemployed", "Retired", "Student", "Other"]),
  occupation: z.string(),
  contractType: z.string(),
  contractDuration: z.string(),
  employerName: z.string(),
  employedSince: z.string().transform((str: string) => new Date(str))
});

// Income Details validation schema
const incomeDetailsSchema = z.object({
  personalId: z.string(),
  grossIncome: z.number().or(z.string().transform(val => parseFloat(val))),
  netIncome: z.number().or(z.string().transform(val => parseFloat(val))),
  taxClass: z.string(),
  taxId: z.string(),
  numberOfSalaries: z.number().or(z.string().transform(val => parseInt(val))),
  childBenefit: z.number().or(z.string().transform(val => parseFloat(val))),
  otherIncome: z.number().or(z.string().transform(val => parseFloat(val))),
  incomeTradeBusiness: z.number().or(z.string().transform(val => parseFloat(val))),
  incomeSelfEmployedWork: z.number().or(z.string().transform(val => parseFloat(val))),
  incomeSideJob: z.number().or(z.string().transform(val => parseFloat(val)))
});

// Expenses Details validation schema
const expensesDetailsSchema = z.object({
  personalId: z.string(),
  coldRent: z.number().or(z.string().transform(val => parseFloat(val))),
  electricity: z.number().or(z.string().transform(val => parseFloat(val))),
  livingExpenses: z.number().or(z.string().transform(val => parseFloat(val))),
  gas: z.number().or(z.string().transform(val => parseFloat(val))),
  telecommunication: z.number().or(z.string().transform(val => parseFloat(val))),
  accountMaintenanceFee: z.number().or(z.string().transform(val => parseFloat(val))),
  alimony: z.number().or(z.string().transform(val => parseFloat(val))),
  subscriptions: z.number().or(z.string().transform(val => parseFloat(val))),
  otherExpenses: z.number().or(z.string().transform(val => parseFloat(val)))
});

// Asset validation schema
const assetSchema = z.object({
  personalId: z.string(),
  realEstate: z.number().or(z.string().transform(val => parseFloat(val))),
  securities: z.number().or(z.string().transform(val => parseFloat(val))),
  bankDeposits: z.number().or(z.string().transform(val => parseFloat(val))),
  buildingSavings: z.number().or(z.string().transform(val => parseFloat(val))),
  insuranceValues: z.number().or(z.string().transform(val => parseFloat(val))),
  otherAssets: z.number().or(z.string().transform(val => parseFloat(val)))
});

// Liability validation schema
const liabilitySchema = z.object({
  personalId: z.string(),
  loanType: z.enum(["PersonalLoan", "HomeLoan", "CarLoan", "BusinessLoan", "EducationLoan", "OtherLoan"]),
  loanBank: z.string().optional(),
  loanAmount: z.number().or(z.string().transform(val => parseFloat(val))).optional(),
  loanMonthlyRate: z.number().or(z.string().transform(val => parseFloat(val))).optional(),
  loanInterest: z.number().or(z.string().transform(val => parseFloat(val))).optional()
});

// Other schemas can be defined as needed...

export class ClientDataController {
  private personalDetailsService: PersonalDetailsService;
  private employmentService: EmploymentDetailsService;
  private incomeService: IncomeService;
  private expensesService: ExpensesService;
  private assetService: AssetService;
  private liabilityService: LiabilityService;
  private goalsAndWishesService: GoalsAndWishesService;
  private riskAppetiteService: RiskAppetiteService;
  private consentService: ConsentService;
  private documentService: DocumentService;
  private formService: FormService;
  private customFormService: CustomFormService;

  constructor() {
    this.personalDetailsService = new PersonalDetailsService();
    this.employmentService = new EmploymentDetailsService();
    this.incomeService = new IncomeService();
    this.expensesService = new ExpensesService();
    this.assetService = new AssetService();
    this.liabilityService = new LiabilityService();
    this.goalsAndWishesService = new GoalsAndWishesService();
    this.riskAppetiteService = new RiskAppetiteService();
    this.consentService = new ConsentService();
    this.documentService = new DocumentService();
    this.formService = new FormService();
    this.customFormService = new CustomFormService();
  }

  // Helper method to check if the current user has access to the personal details
  private async checkAccess(req: Request, personalId: string): Promise<boolean> {
    if (!req.currentUser) {
      return false;
    }

    // Admin has access to everything
    if (req.currentUser.role === 'ADMIN') {
      return true;
    }

    // Get the personal details
    const personalDetails = await this.personalDetailsService.findOne(personalId);
    if (!personalDetails) {
      return false;
    }

    // Coach has access to their clients
    if (req.currentUser.role === 'COACH') {
      return personalDetails.coachId === req.currentUser.id;
    }

    // Clients have access to their own data
    return personalDetails.userId === req.currentUser.id;
  }

  // Employment Details
  async createEmployment(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Validate request body
      try {
        employmentDetailsSchema.parse(req.body);
      } catch (error) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined
        });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const employment = await this.employmentService.create(req.body);
      return res.status(201).json(employment);
    } catch (error) {
      console.error('Error creating employment details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getEmployments(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const employments = await this.employmentService.findByPersonalId(personalId);
      return res.json(employments);
    } catch (error) {
      console.error('Error getting employment details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateEmployment(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the employment details to get personalId
      const employment = await this.employmentService.findOne(id);
      if (!employment) {
        return res.status(404).json({ message: 'Employment details not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, employment.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedEmployment = await this.employmentService.update(id, req.body);
      return res.json(updatedEmployment);
    } catch (error) {
      console.error('Error updating employment details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteEmployment(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the employment details to get personalId
      const employment = await this.employmentService.findOne(id);
      if (!employment) {
        return res.status(404).json({ message: 'Employment details not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, employment.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.employmentService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting employment details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Income Details
  async createIncome(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Validate request body
      try {
        incomeDetailsSchema.parse(req.body);
      } catch (error) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined
        });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Convert string values to numbers if needed
      const incomeData = {
        ...req.body,
        grossIncome: parseFloat(req.body.grossIncome),
        netIncome: parseFloat(req.body.netIncome),
        numberOfSalaries: parseInt(req.body.numberOfSalaries),
        childBenefit: parseFloat(req.body.childBenefit),
        otherIncome: parseFloat(req.body.otherIncome),
        incomeTradeBusiness: parseFloat(req.body.incomeTradeBusiness),
        incomeSelfEmployedWork: parseFloat(req.body.incomeSelfEmployedWork),
        incomeSideJob: parseFloat(req.body.incomeSideJob)
      };

      const income = await this.incomeService.create(incomeData);
      return res.status(201).json(income);
    } catch (error) {
      console.error('Error creating income details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getIncomes(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const incomes = await this.incomeService.findByPersonalId(personalId);
      return res.json(incomes);
    } catch (error) {
      console.error('Error getting income details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateIncome(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the income details to get personalId
      const income = await this.incomeService.findOne(id);
      if (!income) {
        return res.status(404).json({ message: 'Income details not found' });
      } 

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, income.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }   

      const updatedIncome = await this.incomeService.update(id, req.body);
      return res.json(updatedIncome);
    } catch (error) {
      console.error('Error updating income details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteIncome(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the income details to get personalId
      const income = await this.incomeService.findOne(id);
      if (!income) {
        return res.status(404).json({ message: 'Income details not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, income.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.incomeService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting income details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Expenses Details
  async createExpenses(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Validate request body
      try {
        expensesDetailsSchema.parse(req.body);
      } catch (error) {
        console.error('Expenses validation error:', error);
        return res.status(400).json({
          message: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined
        });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Convert string values to numbers if needed
      const expensesData = {
        ...req.body,
        coldRent: parseFloat(req.body.coldRent),
        electricity: parseFloat(req.body.electricity),
        livingExpenses: parseFloat(req.body.livingExpenses),
        gas: parseFloat(req.body.gas),
        telecommunication: parseFloat(req.body.telecommunication),
        accountMaintenanceFee: parseFloat(req.body.accountMaintenanceFee),
        alimony: parseFloat(req.body.alimony),
        subscriptions: parseFloat(req.body.subscriptions),
        otherExpenses: parseFloat(req.body.otherExpenses)
      };

      const expenses = await this.expensesService.create(expensesData);
      return res.status(201).json(expenses);
    } catch (error) {
      console.error('Error creating expenses details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getExpenses(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const expenses = await this.expensesService.findByPersonalId(personalId);
      return res.json(expenses);
    } catch (error) {
      console.error('Error getting expenses details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateExpenses(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the expenses details to get personalId
      const expenses = await this.expensesService.findOne(id);
      if (!expenses) {
        return res.status(404).json({ message: 'Expenses details not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, expenses.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedExpenses = await this.expensesService.update(id, req.body);
      return res.json(updatedExpenses);
    } catch (error) {
      console.error('Error updating expenses details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteExpenses(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the expenses details to get personalId
      const expenses = await this.expensesService.findOne(id);
      if (!expenses) {
        return res.status(404).json({ message: 'Expenses details not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, expenses.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.expensesService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting expenses details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Assets
  async createAsset(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Validate request body
      try {
        assetSchema.parse(req.body);
      } catch (error) {
        console.error('Asset validation error:', error);
        return res.status(400).json({
          message: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined
        });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Convert string values to numbers if needed
      const assetData = {
        ...req.body,
        realEstate: parseFloat(req.body.realEstate),
        securities: parseFloat(req.body.securities),
        bankDeposits: parseFloat(req.body.bankDeposits),
        buildingSavings: parseFloat(req.body.buildingSavings),
        insuranceValues: parseFloat(req.body.insuranceValues),
        otherAssets: parseFloat(req.body.otherAssets)
      };

      // Additional safety check - ensure we're not passing an array
      if (Array.isArray(assetData)) {
        return res.status(400).json({ message: 'Invalid data format: expected object, got array' });
      }
      
      const asset = await this.assetService.create(assetData);
      return res.status(201).json(asset);
    } catch (error) {
      console.error('Error creating asset:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAssets(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const assets = await this.assetService.findByPersonalId(personalId);
      return res.json(assets);
    } catch (error) {
      console.error('Error getting assets:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateAsset(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the asset to get personalId
      const asset = await this.assetService.findOne(id);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      } 

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, asset.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }   

      const updatedAsset = await this.assetService.update(id, req.body);
      return res.json(updatedAsset);
    } catch (error) {
      console.error('Error updating asset:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteAsset(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the asset to get personalId
      const asset = await this.assetService.findOne(id);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, asset.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.assetService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting asset:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Liabilities
  async createLiability(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Validate request body
      try {
        liabilitySchema.parse(req.body);
      } catch (error) {
        console.error('Liability validation error:', error);
        return res.status(400).json({
          message: 'Validation error',
          errors: error instanceof z.ZodError ? error.errors : undefined
        });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Convert string values to numbers if needed
      const liabilityData = {
        ...req.body,
        loanAmount: req.body.loanAmount ? parseFloat(req.body.loanAmount) : undefined,
        loanMonthlyRate: req.body.loanMonthlyRate ? parseFloat(req.body.loanMonthlyRate) : undefined,
        loanInterest: req.body.loanInterest ? parseFloat(req.body.loanInterest) : undefined
      };

      const liability = await this.liabilityService.create(liabilityData);
      return res.status(201).json(liability);
    } catch (error) {
      console.error('Error creating liability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLiabilities(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const liabilities = await this.liabilityService.findByPersonalId(personalId);
      return res.json(liabilities);
    } catch (error) {
      console.error('Error getting liabilities:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateLiability(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the liability to get personalId
      const liability = await this.liabilityService.findOne(id);
      if (!liability) {
        return res.status(404).json({ message: 'Liability not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, liability.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedLiability = await this.liabilityService.update(id, req.body);
      return res.json(updatedLiability);
    } catch (error) {
      console.error('Error updating liability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteLiability(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the liability to get personalId
      const liability = await this.liabilityService.findOne(id);
      if (!liability) {
        return res.status(404).json({ message: 'Liability not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, liability.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.liabilityService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting liability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Goals and Wishes
  async createGoalsAndWishes(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const goalsAndWishes = await this.goalsAndWishesService.upsert(req.body);
      return res.status(201).json(goalsAndWishes);
    } catch (error) {
      console.error('Error creating goals and wishes:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getGoalsAndWishes(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const goalsAndWishes = await this.goalsAndWishesService.findByPersonalId(personalId);
      return res.json(goalsAndWishes);
    } catch (error) {
      console.error('Error getting goals and wishes:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateGoalsAndWishes(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the goals and wishes to get personalId
      const goalsAndWishes = await this.goalsAndWishesService.findOne(id);
      if (!goalsAndWishes) {
        return res.status(404).json({ message: 'Goals and wishes not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, goalsAndWishes.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedGoalsAndWishes = await this.goalsAndWishesService.update(id, req.body);
      return res.json(updatedGoalsAndWishes);
    } catch (error) {
      console.error('Error updating goals and wishes:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteGoalsAndWishes(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the goals and wishes to get personalId
      const goalsAndWishes = await this.goalsAndWishesService.findOne(id);
      if (!goalsAndWishes) {
        return res.status(404).json({ message: 'Goals and wishes not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, goalsAndWishes.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.goalsAndWishesService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting goals and wishes:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Risk Appetite
  async createRiskAppetite(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const riskAppetite = await this.riskAppetiteService.upsert(req.body);
      return res.status(201).json(riskAppetite);
    } catch (error) {
      console.error('Error creating risk appetite:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRiskAppetite(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const riskAppetite = await this.riskAppetiteService.findByPersonalId(personalId);
      return res.json(riskAppetite);
    } catch (error) {
      console.error('Error getting risk appetite:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateRiskAppetite(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the risk appetite to get personalId
      const riskAppetite = await this.riskAppetiteService.findOne(id);
      if (!riskAppetite) {
        return res.status(404).json({ message: 'Risk appetite not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, riskAppetite.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedRiskAppetite = await this.riskAppetiteService.update(id, req.body);
      return res.json(updatedRiskAppetite);
    } catch (error) {
      console.error('Error updating risk appetite:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteRiskAppetite(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the risk appetite to get personalId
      const riskAppetite = await this.riskAppetiteService.findOne(id);
      if (!riskAppetite) {
        return res.status(404).json({ message: 'Risk appetite not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, riskAppetite.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.riskAppetiteService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting risk appetite:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Consents
  async createConsent(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const consent = await this.consentService.create(req.body);
      return res.status(201).json(consent);
    } catch (error) {
      console.error('Error creating consent:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getConsents(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const consents = await this.consentService.findByPersonalId(personalId);
      return res.json(consents);
    } catch (error) {
      console.error('Error getting consents:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateConsent(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the consent to get personalId
      const consent = await this.consentService.findOne(id);
      if (!consent) {
        return res.status(404).json({ message: 'Consent not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, consent.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedConsent = await this.consentService.update(id, req.body);
      return res.json(updatedConsent);
    } catch (error) {
      console.error('Error updating consent:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteConsent(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the consent to get personalId
      const consent = await this.consentService.findOne(id);
      if (!consent) {
        return res.status(404).json({ message: 'Consent not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, consent.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.consentService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting consent:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Documents
  async createDocument(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const document = await this.documentService.create(req.body);
      return res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const documents = await this.documentService.findByPersonalId(personalId);
      return res.json(documents);
    } catch (error) {
      console.error('Error getting documents:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateDocument(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the document to get personalId
      const document = await this.documentService.findOne(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, document.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedDocument = await this.documentService.update(id, req.body);
      return res.json(updatedDocument);
    } catch (error) {
      console.error('Error updating document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the document to get personalId
      const document = await this.documentService.findOne(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, document.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.documentService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Forms
  async createForm(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const form = await this.formService.create(req.body);
      return res.status(201).json(form);
    } catch (error) {
      console.error('Error creating form:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getForms(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const forms = await this.formService.findByPersonalId(personalId);
      return res.json(forms);
    } catch (error) {
      console.error('Error getting forms:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateForm(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the form to get personalId
      const form = await this.formService.findOne(id);
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, form.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedForm = await this.formService.update(id, req.body);
      return res.json(updatedForm);
    } catch (error) {
      console.error('Error updating form:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteForm(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the form to get personalId
      const form = await this.formService.findOne(id);
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, form.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.formService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting form:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Custom Forms
  async createCustomForm(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, req.body.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const customForm = await this.customFormService.create(req.body);
      return res.status(201).json(customForm);
    } catch (error) {
      console.error('Error creating custom form:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCustomForms(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { personalId } = req.params;

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const customForms = await this.customFormService.findByPersonalId(personalId);
      return res.json(customForms);
    } catch (error) {
      console.error('Error getting custom forms:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCustomForm(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the custom form to get personalId
      const customForm = await this.customFormService.findOne(id);
      if (!customForm) {
        return res.status(404).json({ message: 'Custom form not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, customForm.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedCustomForm = await this.customFormService.update(id, req.body);
      return res.json(updatedCustomForm);
    } catch (error) {
      console.error('Error updating custom form:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteCustomForm(req: Request, res: Response) {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Find the custom form to get personalId
      const customForm = await this.customFormService.findOne(id);
      if (!customForm) {
        return res.status(404).json({ message: 'Custom form not found' });
      }

      // Check if the user has access to the personal details
      const hasAccess = await this.checkAccess(req, customForm.personalId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.customFormService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting custom form:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
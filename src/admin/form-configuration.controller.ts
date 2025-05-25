import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createFormConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  formType: z.string().min(1, 'Form type is required'),
  version: z.string().default('1.0'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sections: z.array(z.any()).default([]),
  customFields: z.array(z.any()).default([]),
  consentForm: z.object({
    enabled: z.boolean().default(true),
    customText: z.string().optional(),
    introText: z.string().optional(),
    sections: z.array(z.any()).optional(),
    updatedAt: z.string().optional()
  }).default({ enabled: true }),
  documents: z.array(z.any()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

const updateFormConfigSchema = createFormConfigSchema.partial();

export class FormConfigurationController {
  /**
   * Get all form configurations
   */
  static async getAllConfigurations(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, type, active, search } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
      
      const where: any = {};
      
      if (type) {
        where.formType = type;
      }
      
      if (active !== undefined) {
        where.isActive = active === 'true';
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      const [configurations, total] = await Promise.all([
        prisma.formConfiguration.findMany({
          where,
          skip,
          take,
          include: {
            createdBy: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }),
        prisma.formConfiguration.count({ where })
      ]);
      
      res.json({
        data: configurations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching form configurations:', error);
      res.status(500).json({ error: 'Failed to fetch form configurations' });
    }
  }

  /**
   * Get form configuration by ID
   */
  static async getConfigurationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const configuration = await prisma.formConfiguration.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });
      
      if (!configuration) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      res.json(configuration);
    } catch (error) {
      console.error('Error fetching form configuration:', error);
      res.status(500).json({ error: 'Failed to fetch form configuration' });
    }
  }

  /**
   * Create new form configuration
   */
  static async createConfiguration(req: Request, res: Response) {
    try {
      const validatedData = createFormConfigSchema.parse(req.body);
      
      // Get user ID from request (assuming it's set by auth middleware)
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      // Check if configuration with same name and type already exists
      const existingConfig = await prisma.formConfiguration.findFirst({
        where: {
          name: validatedData.name,
          formType: validatedData.formType
        }
      });
      
      if (existingConfig) {
        return res.status(409).json({ 
          error: 'Form configuration with this name and type already exists' 
        });
      }
      
      const configuration = await prisma.formConfiguration.create({
        data: {
          ...validatedData,
          createdById: userId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      
      console.error('Error creating form configuration:', error);
      res.status(500).json({ error: 'Failed to create form configuration' });
    }
  }

  /**
   * Update form configuration
   */
  static async updateConfiguration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateFormConfigSchema.parse(req.body);
      
      // Check if configuration exists
      const existingConfig = await prisma.formConfiguration.findUnique({
        where: { id }
      });
      
      if (!existingConfig) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      // If name or type is being updated, check for conflicts
      if (validatedData.name || validatedData.formType) {
        const conflictConfig = await prisma.formConfiguration.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              { 
                name: validatedData.name || existingConfig.name,
                formType: validatedData.formType || existingConfig.formType
              }
            ]
          }
        });
        
        if (conflictConfig) {
          return res.status(409).json({ 
            error: 'Form configuration with this name and type already exists' 
          });
        }
      }
      
      const configuration = await prisma.formConfiguration.update({
        where: { id },
        data: validatedData,
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });
      
      res.json(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      
      console.error('Error updating form configuration:', error);
      res.status(500).json({ error: 'Failed to update form configuration' });
    }
  }

  /**
   * Delete form configuration
   */
  static async deleteConfiguration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const existingConfig = await prisma.formConfiguration.findUnique({
        where: { id }
      });
      
      if (!existingConfig) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      await prisma.formConfiguration.delete({
        where: { id }
      });
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting form configuration:', error);
      res.status(500).json({ error: 'Failed to delete form configuration' });
    }
  }

  /**
   * Duplicate form configuration
   */
  static async duplicateConfiguration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, version } = req.body;
      
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const originalConfig = await prisma.formConfiguration.findUnique({
        where: { id }
      });
      
      if (!originalConfig) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      const duplicatedConfig = await prisma.formConfiguration.create({
        data: {
          name: name || `${originalConfig.name} (Copy)`,
          formType: originalConfig.formType,
          version: version || '1.0',
          description: originalConfig.description,
          isActive: false, // Start as inactive
          sections: originalConfig.sections as any,
          customFields: originalConfig.customFields as any,
          consentForm: originalConfig.consentForm as any,
          documents: originalConfig.documents as any,
          createdById: userId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json(duplicatedConfig);
    } catch (error) {
      console.error('Error duplicating form configuration:', error);
      res.status(500).json({ error: 'Failed to duplicate form configuration' });
    }
  }

  /**
   * Toggle configuration status
   */
  static async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const existingConfig = await prisma.formConfiguration.findUnique({
        where: { id }
      });
      
      if (!existingConfig) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      const configuration = await prisma.formConfiguration.update({
        where: { id },
        data: {
          isActive: !existingConfig.isActive
        },
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });
      
      res.json(configuration);
    } catch (error) {
      console.error('Error toggling configuration status:', error);
      res.status(500).json({ error: 'Failed to toggle configuration status' });
    }
  }

  /**
   * Get form types
   */
  static async getFormTypes(req: Request, res: Response) {
    try {
      const formTypes = [
        "immobilien", 
        "privateHealthInsurance", 
        "stateHealthInsurance", 
        "kfz", 
        "loans", 
        "electricity", 
        "sanuspay", 
        "gems"
      ];
      
      res.json(formTypes);
    } catch (error) {
      console.error('Error fetching form types:', error);
      res.status(500).json({ error: 'Failed to fetch form types' });
    }
  }

  /**
   * Get section field definitions
   */
  static async getSectionFields(req: Request, res: Response) {
    try {
      const sectionFields = {
        Personal: [
          'firstName', 'lastName', 'email', 'phone', 'birthDate', 
          'birthPlace', 'nationality', 'maritalStatus', 'address'
        ],
        Family: [
          'hasSpouse', 'spouseFirstName', 'spouseLastName', 'spouseBirthDate',
          'numberOfChildren', 'childrenDetails'
        ],
        Employment: [
          'employmentType', 'occupation', 'employerName', 'employedSince',
          'contractType', 'workingHours'
        ],
        Income: [
          'grossIncome', 'netIncome', 'taxClass', 'numberOfSalaries',
          'childBenefit', 'otherIncome'
        ],
        Expenses: [
          'coldRent', 'electricity', 'gas', 'telecommunication',
          'livingExpenses', 'subscriptions', 'otherExpenses'
        ],
        Assets: [
          'realEstate', 'securities', 'bankDeposits', 'buildingSavings',
          'insuranceValues', 'otherAssets'
        ],
        Liabilities: [
          'loanType', 'loanBank', 'loanAmount', 'loanMonthlyRate',
          'loanInterest'
        ],
        Documents: [
          'idDocument', 'incomeProof', 'bankStatements', 'taxReturns',
          'insuranceDocuments'
        ]
      };
      
      res.json(sectionFields);
    } catch (error) {
      console.error('Error fetching section fields:', error);
      res.status(500).json({ error: 'Failed to fetch section fields' });
    }
  }

  /**
   * Validate form configuration
   */
  static async validateConfiguration(req: Request, res: Response) {
    try {
      const validationResult = createFormConfigSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          valid: false,
          errors: validationResult.error.errors
        });
      }
      
      res.json({
        valid: true,
        message: 'Configuration is valid'
      });
    } catch (error) {
      console.error('Error validating configuration:', error);
      res.status(500).json({ error: 'Failed to validate configuration' });
    }
  }

  /**
   * Export form configuration
   */
  static async exportConfiguration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;
      
      const configuration = await prisma.formConfiguration.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              displayName: true,
              email: true
            }
          }
        }
      });
      
      if (!configuration) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${configuration.name}-config.json"`);
        res.json(configuration);
      } else {
        res.status(400).json({ error: 'Unsupported export format' });
      }
    } catch (error) {
      console.error('Error exporting configuration:', error);
      res.status(500).json({ error: 'Failed to export configuration' });
    }
  }

  /**
   * Get configuration statistics
   */
  static async getConfigurationStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const configuration = await prisma.formConfiguration.findUnique({
        where: { id }
      });
      
      if (!configuration) {
        return res.status(404).json({ error: 'Form configuration not found' });
      }
      
      const stats = {
        usageCount: configuration.usageCount,
        lastUsedAt: configuration.lastUsedAt,
        createdAt: configuration.createdAt,
        updatedAt: configuration.updatedAt,
        isActive: configuration.isActive
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching configuration stats:', error);
      res.status(500).json({ error: 'Failed to fetch configuration stats' });
    }
  }
} 
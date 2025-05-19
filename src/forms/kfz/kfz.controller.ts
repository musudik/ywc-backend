import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for KFZ (auto insurance) form
const kfzFormSchema = z.object({
  insuranceCompany: z.string(),
  policyNumber: z.string(),
  startDate: z.string().transform((str: string) => new Date(str)),
  endDate: z.string().transform((str: string) => new Date(str)).optional(),
  vehicleMake: z.string(),
  vehicleModel: z.string(),
  licensePlate: z.string(),
  vinNumber: z.string(),
  yearOfManufacture: z.number(),
  insuranceType: z.enum(['Liability', 'Partial Comprehensive', 'Comprehensive']),
  coverageAmount: z.number(),
  deductible: z.number().optional(),
  monthlyPremium: z.number(),
  paymentFrequency: z.enum(['Monthly', 'Quarterly', 'Semi-Annually', 'Annually']),
  additionalDrivers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    birthDate: z.string().transform((str: string) => new Date(str)),
    licenseNumber: z.string(),
  })).optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export class KfzController {
  // Create a new KFZ form
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = kfzFormSchema.parse(req.body);

      const kfzForm = await prisma.kfzForm.create({
        data: {
          userId,
          insuranceCompany: validatedData.insuranceCompany,
          policyNumber: validatedData.policyNumber,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          vehicleMake: validatedData.vehicleMake,
          vehicleModel: validatedData.vehicleModel,
          licensePlate: validatedData.licensePlate,
          vinNumber: validatedData.vinNumber,
          yearOfManufacture: validatedData.yearOfManufacture,
          insuranceType: validatedData.insuranceType,
          coverageAmount: validatedData.coverageAmount,
          deductible: validatedData.deductible,
          monthlyPremium: validatedData.monthlyPremium,
          paymentFrequency: validatedData.paymentFrequency,
          additionalDrivers: validatedData.additionalDrivers,
          documents: validatedData.documents,
          notes: validatedData.notes,
          status: 'Submitted',
        },
      });

      return res.status(201).json({
        success: true,
        formId: kfzForm.id,
        message: 'KFZ form submitted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Error creating KFZ form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create KFZ form' 
      });
    }
  }

  // Get all KFZ forms for the current user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const kfzForms = await prisma.kfzForm.findMany({
        where: { userId },
      });

      return res.json(kfzForms);
    } catch (error) {
      console.error('Error fetching KFZ forms:', error);
      return res.status(500).json({ message: 'Failed to fetch KFZ forms' });
    }
  }

  // Get a specific KFZ form
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const kfzForm = await prisma.kfzForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!kfzForm) {
        return res.status(404).json({ message: 'KFZ form not found' });
      }

      return res.json(kfzForm);
    } catch (error) {
      console.error('Error fetching KFZ form:', error);
      return res.status(500).json({ message: 'Failed to fetch KFZ form' });
    }
  }

  // Update a KFZ form
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = kfzFormSchema.parse(req.body);

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.kfzForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'KFZ form not found' 
        });
      }

      const updatedForm = await prisma.kfzForm.update({
        where: { id },
        data: {
          insuranceCompany: validatedData.insuranceCompany,
          policyNumber: validatedData.policyNumber,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          vehicleMake: validatedData.vehicleMake,
          vehicleModel: validatedData.vehicleModel,
          licensePlate: validatedData.licensePlate,
          vinNumber: validatedData.vinNumber,
          yearOfManufacture: validatedData.yearOfManufacture,
          insuranceType: validatedData.insuranceType,
          coverageAmount: validatedData.coverageAmount,
          deductible: validatedData.deductible,
          monthlyPremium: validatedData.monthlyPremium,
          paymentFrequency: validatedData.paymentFrequency,
          additionalDrivers: validatedData.additionalDrivers,
          documents: validatedData.documents,
          notes: validatedData.notes,
        },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'KFZ form updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error updating KFZ form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update KFZ form' 
      });
    }
  }

  // Delete a KFZ form
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.kfzForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'KFZ form not found' 
        });
      }

      await prisma.kfzForm.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'KFZ form deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting KFZ form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete KFZ form' 
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
      const existingForm = await prisma.kfzForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'KFZ form not found' 
        });
      }

      const updatedForm = await prisma.kfzForm.update({
        where: { id },
        data: { status },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'KFZ form status updated successfully',
      });
    } catch (error) {
      console.error('Error updating KFZ form status:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update KFZ form status' 
      });
    }
  }
} 
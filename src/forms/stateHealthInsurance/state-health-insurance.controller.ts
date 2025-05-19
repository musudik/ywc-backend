import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for State Health Insurance form
const stateHealthInsuranceFormSchema = z.object({
  insuranceProvider: z.string(),
  memberNumber: z.string(),
  startDate: z.string().transform((str: string) => new Date(str)),
  insuranceClass: z.string(),
  additionalContributions: z.number().optional(),
  familyInsured: z.boolean(),
  familyMembers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    birthDate: z.string().transform((str: string) => new Date(str)),
    relationship: z.string(),
  })).optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export class StateHealthInsuranceController {
  // Create a new state health insurance form
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = stateHealthInsuranceFormSchema.parse(req.body);

      const stateHealthInsuranceForm = await prisma.stateHealthInsuranceForm.create({
        data: {
          userId,
          insuranceProvider: validatedData.insuranceProvider,
          memberNumber: validatedData.memberNumber,
          startDate: validatedData.startDate,
          insuranceClass: validatedData.insuranceClass,
          additionalContributions: validatedData.additionalContributions,
          familyInsured: validatedData.familyInsured,
          familyMembers: validatedData.familyMembers,
          documents: validatedData.documents,
          notes: validatedData.notes,
          status: 'Submitted',
        },
      });

      return res.status(201).json({
        success: true,
        formId: stateHealthInsuranceForm.id,
        message: 'State Health Insurance form submitted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Error creating state health insurance form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create state health insurance form' 
      });
    }
  }

  // Get all state health insurance forms for the current user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const stateHealthInsuranceForms = await prisma.stateHealthInsuranceForm.findMany({
        where: { userId },
      });

      return res.json(stateHealthInsuranceForms);
    } catch (error) {
      console.error('Error fetching state health insurance forms:', error);
      return res.status(500).json({ message: 'Failed to fetch state health insurance forms' });
    }
  }

  // Get a specific state health insurance form
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const stateHealthInsuranceForm = await prisma.stateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!stateHealthInsuranceForm) {
        return res.status(404).json({ message: 'State Health Insurance form not found' });
      }

      return res.json(stateHealthInsuranceForm);
    } catch (error) {
      console.error('Error fetching state health insurance form:', error);
      return res.status(500).json({ message: 'Failed to fetch state health insurance form' });
    }
  }

  // Update a state health insurance form
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = stateHealthInsuranceFormSchema.parse(req.body);

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.stateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'State Health Insurance form not found' 
        });
      }

      const updatedForm = await prisma.stateHealthInsuranceForm.update({
        where: { id },
        data: {
          insuranceProvider: validatedData.insuranceProvider,
          memberNumber: validatedData.memberNumber,
          startDate: validatedData.startDate,
          insuranceClass: validatedData.insuranceClass,
          additionalContributions: validatedData.additionalContributions,
          familyInsured: validatedData.familyInsured,
          familyMembers: validatedData.familyMembers,
          documents: validatedData.documents,
          notes: validatedData.notes,
        },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'State Health Insurance form updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error updating state health insurance form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update state health insurance form' 
      });
    }
  }

  // Delete a state health insurance form
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.stateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'State Health Insurance form not found' 
        });
      }

      await prisma.stateHealthInsuranceForm.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'State Health Insurance form deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting state health insurance form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete state health insurance form' 
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
      const existingForm = await prisma.stateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'State Health Insurance form not found' 
        });
      }

      const updatedForm = await prisma.stateHealthInsuranceForm.update({
        where: { id },
        data: { status },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'State Health Insurance form status updated successfully',
      });
    } catch (error) {
      console.error('Error updating state health insurance form status:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update state health insurance form status' 
      });
    }
  }
} 
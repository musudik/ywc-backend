import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for Private Health Insurance form
const privateHealthInsuranceFormSchema = z.object({
  insuranceCompany: z.string(),
  policyNumber: z.string(),
  startDate: z.string().transform((str: string) => new Date(str)),
  monthlyPremium: z.number(),
  coverageType: z.string(),
  deductible: z.number().optional(),
  beneficiaries: z.array(z.string()).optional(),
  additionalCoverage: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export class PrivateHealthInsuranceController {
  // Create a new private health insurance form
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = privateHealthInsuranceFormSchema.parse(req.body);

      const privateHealthInsuranceForm = await prisma.privateHealthInsuranceForm.create({
        data: {
          userId,
          insuranceCompany: validatedData.insuranceCompany,
          policyNumber: validatedData.policyNumber,
          startDate: validatedData.startDate,
          monthlyPremium: validatedData.monthlyPremium,
          coverageType: validatedData.coverageType,
          deductible: validatedData.deductible,
          beneficiaries: validatedData.beneficiaries,
          additionalCoverage: validatedData.additionalCoverage,
          documents: validatedData.documents,
          notes: validatedData.notes,
          status: 'Submitted',
        },
      });

      return res.status(201).json({
        success: true,
        formId: privateHealthInsuranceForm.id,
        message: 'Private Health Insurance form submitted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Error creating private health insurance form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create private health insurance form' 
      });
    }
  }

  // Get all private health insurance forms for the current user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const privateHealthInsuranceForms = await prisma.privateHealthInsuranceForm.findMany({
        where: { userId },
      });

      return res.json(privateHealthInsuranceForms);
    } catch (error) {
      console.error('Error fetching private health insurance forms:', error);
      return res.status(500).json({ message: 'Failed to fetch private health insurance forms' });
    }
  }

  // Get a specific private health insurance form
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const privateHealthInsuranceForm = await prisma.privateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!privateHealthInsuranceForm) {
        return res.status(404).json({ message: 'Private Health Insurance form not found' });
      }

      return res.json(privateHealthInsuranceForm);
    } catch (error) {
      console.error('Error fetching private health insurance form:', error);
      return res.status(500).json({ message: 'Failed to fetch private health insurance form' });
    }
  }

  // Update a private health insurance form
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = privateHealthInsuranceFormSchema.parse(req.body);

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.privateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Private Health Insurance form not found' 
        });
      }

      const updatedForm = await prisma.privateHealthInsuranceForm.update({
        where: { id },
        data: {
          insuranceCompany: validatedData.insuranceCompany,
          policyNumber: validatedData.policyNumber,
          startDate: validatedData.startDate,
          monthlyPremium: validatedData.monthlyPremium,
          coverageType: validatedData.coverageType,
          deductible: validatedData.deductible,
          beneficiaries: validatedData.beneficiaries,
          additionalCoverage: validatedData.additionalCoverage,
          documents: validatedData.documents,
          notes: validatedData.notes,
        },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'Private Health Insurance form updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error updating private health insurance form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update private health insurance form' 
      });
    }
  }

  // Delete a private health insurance form
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.privateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Private Health Insurance form not found' 
        });
      }

      await prisma.privateHealthInsuranceForm.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Private Health Insurance form deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting private health insurance form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete private health insurance form' 
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
      const existingForm = await prisma.privateHealthInsuranceForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Private Health Insurance form not found' 
        });
      }

      const updatedForm = await prisma.privateHealthInsuranceForm.update({
        where: { id },
        data: { status },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'Private Health Insurance form status updated successfully',
      });
    } catch (error) {
      console.error('Error updating private health insurance form status:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update private health insurance form status' 
      });
    }
  }
} 
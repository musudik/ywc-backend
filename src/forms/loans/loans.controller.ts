import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for Loans form
const loansFormSchema = z.object({
  lender: z.string(),
  loanType: z.string(),
  accountNumber: z.string(),
  startDate: z.string().transform((str: string) => new Date(str)),
  endDate: z.string().transform((str: string) => new Date(str)).optional(),
  loanAmount: z.number(),
  interestRate: z.number(),
  monthlyPayment: z.number(),
  remainingBalance: z.number(),
  collateral: z.string().optional(),
  purpose: z.string(),
  coBorrowers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    relationship: z.string(),
  })).optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export class LoansController {
  // Create a new loans form
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = loansFormSchema.parse(req.body);

      const loansForm = await prisma.loansForm.create({
        data: {
          userId,
          lender: validatedData.lender,
          loanType: validatedData.loanType,
          accountNumber: validatedData.accountNumber,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          loanAmount: validatedData.loanAmount,
          interestRate: validatedData.interestRate,
          monthlyPayment: validatedData.monthlyPayment,
          remainingBalance: validatedData.remainingBalance,
          collateral: validatedData.collateral,
          purpose: validatedData.purpose,
          coBorrowers: validatedData.coBorrowers,
          documents: validatedData.documents,
          notes: validatedData.notes,
          status: 'Submitted',
        },
      });

      return res.status(201).json({
        success: true,
        formId: loansForm.id,
        message: 'Loans form submitted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Error creating loans form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create loans form' 
      });
    }
  }

  // Get all loans forms for the current user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const loansForms = await prisma.loansForm.findMany({
        where: { userId },
      });

      return res.json(loansForms);
    } catch (error) {
      console.error('Error fetching loans forms:', error);
      return res.status(500).json({ message: 'Failed to fetch loans forms' });
    }
  }

  // Get a specific loans form
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const loansForm = await prisma.loansForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!loansForm) {
        return res.status(404).json({ message: 'Loans form not found' });
      }

      return res.json(loansForm);
    } catch (error) {
      console.error('Error fetching loans form:', error);
      return res.status(500).json({ message: 'Failed to fetch loans form' });
    }
  }

  // Update a loans form
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = loansFormSchema.parse(req.body);

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.loansForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Loans form not found' 
        });
      }

      const updatedForm = await prisma.loansForm.update({
        where: { id },
        data: {
          lender: validatedData.lender,
          loanType: validatedData.loanType,
          accountNumber: validatedData.accountNumber,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          loanAmount: validatedData.loanAmount,
          interestRate: validatedData.interestRate,
          monthlyPayment: validatedData.monthlyPayment,
          remainingBalance: validatedData.remainingBalance,
          collateral: validatedData.collateral,
          purpose: validatedData.purpose,
          coBorrowers: validatedData.coBorrowers,
          documents: validatedData.documents,
          notes: validatedData.notes,
        },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'Loans form updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error updating loans form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update loans form' 
      });
    }
  }

  // Delete a loans form
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if the form exists and belongs to the user
      const existingForm = await prisma.loansForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Loans form not found' 
        });
      }

      await prisma.loansForm.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Loans form deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting loans form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete loans form' 
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
      const existingForm = await prisma.loansForm.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Loans form not found' 
        });
      }

      const updatedForm = await prisma.loansForm.update({
        where: { id },
        data: { status },
      });

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'Loans form status updated successfully',
      });
    } catch (error) {
      console.error('Error updating loans form status:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update loans form status' 
      });
    }
  }
} 
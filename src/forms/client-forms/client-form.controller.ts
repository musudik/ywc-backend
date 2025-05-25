import { Request, Response } from 'express';
import { z } from 'zod';
import { ClientFormService } from './client-form.service';

// Validation schema for client form
const clientFormSchema = z.object({
  formType: z.string(),
  formName: z.string(),
  formData: z.any().optional(), // Make formData optional
  status: z.string().optional(),
  // Accept direct form fields as well (for backward compatibility)
  primaryApplicant: z.any().optional(),
  secondaryApplicant: z.any().optional(),
  metadata: z.any().optional(),
  consent: z.any().optional(),
  property: z.any().optional(),
  loan: z.any().optional(),
  documents: z.any().optional(),
  userId: z.string().optional(),
  submittedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export class ClientFormController {
  private clientFormService = new ClientFormService();

  /**
   * Create a new client form
   */
  async create(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedData = clientFormSchema.parse(req.body);
      
      // Handle both wrapped and unwrapped form data structures
      let actualFormData;
      if (validatedData.formData) {
        // Data is already wrapped in formData property
        actualFormData = validatedData.formData;
      } else {
        // Data is sent directly, wrap it in formData
        const { formType, formName, status, ...restData } = validatedData;
        actualFormData = restData;
      }
      
      const clientForm = await this.clientFormService.create({
        userId,
        formType: validatedData.formType,
        formName: validatedData.formName,
        formData: actualFormData,
        status: validatedData.status,
        lastEditedBy: userId
      });

            return res.status(201).json({        success: true,        data: clientForm,        formId: clientForm.id,        message: 'Client form created successfully'      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Error creating client form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create client form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all client forms for the current user
   */
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authenticated' 
        });
      }

      const clientForms = await this.clientFormService.getByUserId(userId);
      return res.json({
        success: true,
        data: clientForms,
        message: 'Client forms fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching client forms:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch client forms',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific client form
   */
  async getOne(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const clientForm = await this.clientFormService.getById(id);

      if (!clientForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Client form not found' 
        });
      }

      // Check if the user has access to this form
      if (clientForm.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied' 
        });
      }

      return res.json({
        success: true,
        data: clientForm,
        message: 'Client form fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching client form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch client form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a client form
   */
  async update(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      console.log("Request Body", req.body);
      const { id } = req.params;
      
      const validatedData = clientFormSchema.parse(req.body);
      console.log("Validated Data", validatedData);
      
      // Handle both wrapped and unwrapped form data structures
      let actualFormData;
      if (validatedData.formData) {
        // Data is already wrapped in formData property
        actualFormData = validatedData.formData;
      } else {
        // Data is sent directly, wrap it in formData
        const { formType, formName, status, ...restData } = validatedData;
        actualFormData = restData;
      }
      
      // Check if the form exists and belongs to the user
      const existingForm = await this.clientFormService.getById(id);
      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Client form not found' 
        });
      }

      // Check if the user has access to this form
      if (existingForm.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedForm = await this.clientFormService.update(id, {
        formName: validatedData.formName,
        formData: actualFormData,
        status: validatedData.status,
        lastEditedBy: userId
      });

           return res.json({        success: true,        data: updatedForm,        formId: updatedForm.id,        message: 'Client form updated successfully'      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error updating client form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update client form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a client form
   */
  async delete(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;

      // Check if the form exists and belongs to the user
      const existingForm = await this.clientFormService.getById(id);
      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Client form not found' 
        });
      }

      // Check if the user has access to this form
      if (existingForm.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await this.clientFormService.delete(id);

      return res.json({
        success: true,
        message: 'Client form deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting client form:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete client form',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update form status
   */
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
      const existingForm = await this.clientFormService.getById(id);
      if (!existingForm) {
        return res.status(404).json({ 
          success: false,
          message: 'Client form not found' 
        });
      }

      // Check if the user has access to this form
      if (existingForm.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedForm = await this.clientFormService.updateStatus(id, status);

      return res.json({
        success: true,
        formId: updatedForm.id,
        message: 'Client form status updated successfully'
      });
    } catch (error) {
      console.error('Error updating client form status:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update client form status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clean up duplicate client forms
   * Admin-only endpoint
   */
  async cleanupDuplicates(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Check if user has admin role
      const userRole = req.currentUser?.role?.name;
      if (userRole !== 'Admin' && userRole !== 'Coach') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Admin or Coach role required.' 
        });
      }
      
      const result = await this.clientFormService.cleanupDuplicates();
      return res.json(result);
    } catch (error) {
      console.error('Error cleaning up duplicate forms:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to clean up duplicates',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 
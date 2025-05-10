import { Request, Response } from 'express';
import { PersonalDetailsService } from '../services';
import { PersonalDetailsInput } from '../types';
import { z } from 'zod';

// Validation schema
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
  birthDate: z.string().transform((str: string) => new Date(str)),
  birthPlace: z.string(),
  maritalStatus: z.string(),
  nationality: z.string(),
  housing: z.string()
});

export class PersonalDetailsController {
  private service: PersonalDetailsService;

  constructor() {
    this.service = new PersonalDetailsService();
  }

  // Create a new personal details record
  async create(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Validate request body
      try {
        personalDetailsSchema.parse(req.body);
      } catch (error) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error instanceof z.ZodError ? error.errors : undefined 
        });
      }
      
      const personalDetails = await this.service.create(req.body as PersonalDetailsInput);
      return res.status(201).json(personalDetails);
    } catch (error) {
      console.error('Error creating personal details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all personal details (coach only)
  async getAll(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Get coach ID from query params or use the current user's ID
      let coachId = req.query.coachId as string;
      
      // If user is not ADMIN or COACH, they can only view their own data
      if (req.currentUser.role !== 'ADMIN' && req.currentUser.role !== 'COACH') {
        coachId = req.currentUser.id;
      }
      
      const personalDetails = await this.service.findAll(coachId);
      return res.json(personalDetails);
    } catch (error) {
      console.error('Error getting personal details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get one personal details record
  async getOne(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { id } = req.params;
      const personalDetails = await this.service.findOne(id);
      
      if (!personalDetails) {
        return res.status(404).json({ message: 'Personal details not found' });
      }
      
      // Check permissions: ADMIN or COACH can access any record, others only their own
      if (req.currentUser.role !== 'ADMIN' && req.currentUser.role !== 'COACH' && 
          personalDetails.coachId !== req.currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      return res.json(personalDetails);
    } catch (error) {
      console.error('Error getting personal details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update personal details
  async update(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { id } = req.params;
      
      // Find the personal details to check permissions
      const existingDetails = await this.service.findOne(id);
      if (!existingDetails) {
        return res.status(404).json({ message: 'Personal details not found' });
      }
      
      // Check permissions: ADMIN or COACH can update any record, others only their own
      if (req.currentUser.role !== 'ADMIN' && req.currentUser.role !== 'COACH' && 
          existingDetails.coachId !== req.currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update the record
      const updatedDetails = await this.service.update(id, req.body);
      return res.json(updatedDetails);
    } catch (error) {
      console.error('Error updating personal details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete personal details
  async delete(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { id } = req.params;
      
      // Find the personal details to check permissions
      const existingDetails = await this.service.findOne(id);
      if (!existingDetails) {
        return res.status(404).json({ message: 'Personal details not found' });
      }
      
      // Only ADMIN or the owner COACH can delete
      if (req.currentUser.role !== 'ADMIN' && 
          (req.currentUser.role !== 'COACH' || existingDetails.coachId !== req.currentUser.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Delete the record
      await this.service.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting personal details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 
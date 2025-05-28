import { Request, Response } from 'express';
import { PersonalDetailsService } from '../services';
import { PersonalDetailsInput } from '../types';
import { z } from 'zod';

// Validation schema
const personalDetailsSchema = z.object({
  coachId: z.string(),
  userId: z.string().optional(),
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

// Update validation schema - all fields are optional for updates
const personalDetailsUpdateSchema = personalDetailsSchema.partial().extend({
  id: z.string().optional(),
  userId: z.string().optional(),
  personalId: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  coach: z.string().optional(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string(),
    roleId: z.string()
  }).optional(),
  employmentDetails: z.array(z.any()).optional(),
  incomeDetails: z.array(z.any()).optional(),
  expensesDetails: z.array(z.any()).optional(),
  assets: z.array(z.any()).optional(),
  liabilities: z.array(z.any()).optional(),
  goalsAndWishes: z.any().nullable().optional(),
  riskAppetite: z.any().nullable().optional()
});

export class PersonalDetailsController {
  private service: PersonalDetailsService;

  constructor() {
    this.service = new PersonalDetailsService();
  }

  // Create a new personal details record
  async create(req: Request, res: Response) {
    console.log('create:: req', req);
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Validate request body
      try {
        personalDetailsSchema.parse(req.body);
      } catch (error) {
        console.error('Validation error:', error);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error instanceof z.ZodError ? error.errors : undefined 
        });
      }
      
      // Determine the userId based on the user's role and request
      let userId: string;
      
      if (req.body.userId) {
        // If userId is explicitly provided in the request, use it
        userId = req.body.userId;
        console.log('Using provided userId:', userId);
      } else if (req.currentUser.role === 'ADMIN' || req.currentUser.role === 'COACH') {
        // For Admins and Coaches, check if client already exists by email
        if (req.body.email) {
          console.log('Checking if client already exists with email:', req.body.email);
          
          // Look for existing personal details with this email
          const existingClients = await this.service.findAll(req.currentUser.id);
          const existingClient = existingClients.find(client => 
            client.email === req.body.email
          );
          
          if (existingClient) {
            console.log('Found existing client with userId:', existingClient.userId);
            userId = existingClient.userId;
          } else {
            console.log('No existing client found, generating new userId');
            userId = await this.service.generateNewUserId();
            console.log('Generated new userId for client:', userId);
          }
        } else {
          // No email provided, generate new userId
          userId = await this.service.generateNewUserId();
          console.log('Generated new userId for client (no email provided):', userId);
        }
      } else {
        // For regular users (clients), use their own ID
        userId = req.currentUser.id;
        console.log('Using current user ID:', userId);
      }
      
      const data = {
        ...req.body,
        userId: userId
      };
      
      console.log('Creating/updating personal details with data:', JSON.stringify(data, null, 2));
      
      // Use upsert to handle both create and update cases
      const personalDetails = await this.service.upsert(data as PersonalDetailsInput);
      return res.status(200).json(personalDetails);
    } catch (error: any) {
      console.error('Error creating personal details:', error);
      console.error('Error details:', {
        code: error?.code,
        meta: error?.meta,
        message: error?.message
      });
      
      // Handle specific Prisma errors
      if (error?.code === 'P2002') {
        console.error('Unique constraint violation:', error.meta);
        return res.status(409).json({ 
          message: 'Personal details already exist for this user',
          error: 'DUPLICATE_USER',
          details: 'A user can only have one personal details record. Use update instead.',
          field: error.meta?.target?.[0] || 'userId'
        });
      }
      
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error?.message || 'Unknown error occurred',
        code: error?.code || 'UNKNOWN_ERROR'
      });
    }
  }

  // Get all personal details (coach only)
  async getAll(req: Request, res: Response) {
    console.log('getAll:: req', req);
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        console.log('User not authenticated');
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      console.log('Current user:', JSON.stringify(req.currentUser, null, 2));
      
      // Get coach ID from query params or use the current user's ID
      let coachId = req.query.coachId as string;
      console.log('Query coachId:', coachId);
      
      // If user is not ADMIN or COACH, they can only view their own data
      if (req.currentUser.role !== 'ADMIN' && req.currentUser.role !== 'COACH') {
        console.log('User is not ADMIN or COACH, using currentUser.id');
        coachId = req.currentUser.id;
      }
      
      console.log('Using coachId for query:', coachId);
      
      // For clients, we should look for personal details where userId matches their ID
      if (req.currentUser.role === 'CLIENT') {
        console.log('User is CLIENT, looking for personal details with userId:', req.currentUser.id);
        const personalDetails = await this.service.findOne(req.currentUser.id);
        console.log('Found personal details:', personalDetails ? 'Yes' : 'No');
        
        if (personalDetails) {
          return res.json([personalDetails]);
        } else {
          return res.json([]);
        }
      }
      
      const personalDetails = await this.service.findAll(coachId);
      console.log('Found personal details count:', personalDetails.length);
      return res.json(personalDetails);
    } catch (error) {
      console.error('Error getting personal details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get one personal details record
  async getOne(req: Request, res: Response) {
    console.log('getOne:: req', req);
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { id } = req.params;
      console.log('getOne:: id', id);
      const personalDetails = await this.service.findOne(id);
      
      if (!personalDetails) {
        return res.status(404).json({ message: 'Personal details not found' });
      }
      
      // Check permissions: ADMIN or COACH can access any record, others only their own
      if (req.currentUser.role !== 'ADMIN' && req.currentUser.role !== 'COACH' && 
          personalDetails.userId !== req.currentUser.id && personalDetails.coachId !== req.currentUser.id) {
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
      console.log('update:: id', id);
      console.log('update:: request body', JSON.stringify(req.body, null, 2));
      
      // Find the personal details to check permissions
      const existingDetails = await this.service.findOne(id);
      console.log('update:: existingDetails', existingDetails);
      if (!existingDetails) {
        return res.status(404).json({ message: 'Personal details not found' });
      }
      
      // Check permissions: ADMIN or COACH can update any record, others only their own
      if (req.currentUser.role !== 'ADMIN' && req.currentUser.role !== 'COACH' && 
          existingDetails.userId !== req.currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Validate request body
      try {
        personalDetailsUpdateSchema.parse(req.body);
      } catch (error) {
        console.error('Validation error:', error);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error instanceof z.ZodError ? error.errors : undefined 
        });
      }
      
      // Extract only the updatable fields from the request body
      const updateData = {
        coachId: req.body.coachId,
        applicantType: req.body.applicantType,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        streetAddress: req.body.streetAddress,
        postalCode: req.body.postalCode,
        city: req.body.city,
        phone: req.body.phone,
        email: req.body.email,
        birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined,
        birthPlace: req.body.birthPlace,
        maritalStatus: req.body.maritalStatus,
        nationality: req.body.nationality,
        housing: req.body.housing
      };
      
      // Filter out undefined values
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );
      
      console.log('update:: filtered data', JSON.stringify(filteredUpdateData, null, 2));
      
      // Update the record
      const updatedDetails = await this.service.update(id, filteredUpdateData);
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
import { Request, Response } from 'express';
import { ProfileCompletionService } from '../services/profile-completion.service';

export class ProfileCompletionController {
  private service: ProfileCompletionService;

  constructor() {
    this.service = new ProfileCompletionService();
  }

  /**
   * Get the profile completion status for the current user
   */
  async getCompletionStatus(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.currentUser) {
        console.log('User not authenticated');
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Allow both clients and coaches to check profile completion status
      // Clients can check their own profile
      // Coaches can check profiles of their clients
      if (req.currentUser.role !== 'CLIENT' && req.currentUser.role !== 'COACH' && req.currentUser.role !== 'ADMIN') {
        console.log(`User role not allowed: ${req.currentUser.role}`);
        return res.status(403).json({ message: 'Access denied. Only clients, coaches, or admins can check profile completion status.' });
      }
      
      const userId = req.currentUser.id;
      console.log(`Getting profile completion status for user ID: ${userId}, role: ${req.currentUser.role}`);
      
      const completionStatus = await this.service.getProfileCompletionStatus(userId);
      
      console.log('Profile completion status:', JSON.stringify(completionStatus, null, 2));
      return res.json(completionStatus);
    } catch (error) {
      console.error('Error getting profile completion status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 
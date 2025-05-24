import { Request, Response } from 'express';
import { PrismaClient } from '../../../generated/prisma';
import { AuthService, LoginDto, RegisterUserDto } from '../services/auth-service';
import * as jwt from 'jsonwebtoken';

const authService = new AuthService();
const prisma = new PrismaClient();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterUserDto = req.body;
      
      // Validate input data
      if (!userData.email || !userData.password || !userData.roleName) {
        res.status(400).json({ message: 'Email, password, and role are required' });
        return;
      }
      
      const user = await authService.registerUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific errors
      if (error.message === 'Email already in use') {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
      
      if (error.message.includes('Role') && error.message.includes('not found')) {
        res.status(400).json({ message: error.message });
        return;
      }
      
      res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginDto = req.body;
      
      // Validate input data
      if (!loginData.email || !loginData.password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }
      
      // Call the login service
      const result = await authService.loginUser(loginData);
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }
      
      // Generic error
      res.status(500).json({ message: 'Failed to login', error: error.message });
    }
  }

  /**
   * Handle the verification of a user's email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({ message: 'Verification token is required' });
        return;
      }
      
      // Verify the token
      const isVerified = await authService.verifyEmail(token);
      
      if (isVerified) {
        res.status(200).json({ message: 'Email verified successfully' });
      } else {
        res.status(400).json({ message: 'Email verification failed' });
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      if (error.message === 'Invalid or expired verification token') {
        res.status(400).json({ message: error.message });
        return;
      }
      
      res.status(500).json({ message: 'Failed to verify email', error: error.message });
    }
  }

  /**
   * Send a password reset email
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }
      
      await authService.sendPasswordResetEmail(email);
      // For security reasons, always return success even if the email doesn't exist
      res.status(200).json({ message: 'If the email exists, a password reset link will be sent' });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to send password reset email', error: error.message });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json({ message: 'Token and new password are required' });
        return;
      }
      
      const isReset = await authService.resetPassword(token, newPassword);
      
      if (isReset) {
        res.status(200).json({ message: 'Password reset successfully' });
      } else {
        res.status(400).json({ message: 'Password reset failed' });
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.message === 'Invalid or expired reset token') {
        res.status(400).json({ message: error.message });
        return;
      }
      
      res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
  }

  /**
   * Get the current authenticated user's profile
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // The authenticated user is already attached to the request by the authenticate middleware
      if (!req.currentUser) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      
      res.status(200).json({
        id: req.currentUser.id,
        email: req.currentUser.email,
        displayName: req.currentUser.displayName,
        phoneNumber: req.currentUser.phoneNumber,
        emailVerified: req.currentUser.emailVerified,
        profileImage: req.currentUser.profileImage,
        role: req.currentUser.role ? {
          id: req.currentUser.role.id,
          name: req.currentUser.role.name,
        } : null,
      });
    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Failed to get user profile', error: error.message });
    }
  }

  /**
   * Update the current user's profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.currentUser) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      
      const { displayName, phoneNumber, profileImage } = req.body;
      
      // Update in database
      const updatedUser = await prisma.user.update({
        where: { id: req.currentUser.id },
        data: {
          displayName,
          phoneNumber,
          profileImage,
        },
        include: { role: true },
      });
      
      res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        phoneNumber: updatedUser.phoneNumber,
        emailVerified: updatedUser.emailVerified,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role ? {
          id: updatedUser.role.id,
          name: updatedUser.role.name,
        } : null,
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }

  /**
   * Refresh a user's token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Since we're using the authenticate middleware, the user is already verified
      if (!req.currentUser) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      
      // Generate a new JWT token for the authenticated user
      const token = jwt.sign(
        {
          userId: req.currentUser.id,
          email: req.currentUser.email,
          role: req.currentUser.role
        }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      
      res.status(200).json({
        token,
        user: {
          id: req.currentUser.id,
          email: req.currentUser.email,
          displayName: req.currentUser.displayName,
          phoneNumber: req.currentUser.phoneNumber,
          emailVerified: req.currentUser.emailVerified,
          role: req.currentUser.role ? {
            id: req.currentUser.role.id,
            name: req.currentUser.role.name,
          } : null,
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(500).json({ message: 'Failed to refresh token', error: error.message });
    }
  }

  /**
   * Logout a user (stateless - just return success)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Since we're using stateless JWTs, logout is handled client-side
      // This endpoint exists for API compatibility
      console.log('User logout requested');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Failed to logout', error: error.message });
    }
  }
} 
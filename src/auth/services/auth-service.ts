import { PrismaClient } from '../../../generated/prisma';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export interface RegisterUserDto {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  roleName: string;
  firebaseUid?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
  expiresIn: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  role: {
    id: string;
    name: string;
  } | null;
}

export class AuthService {
  /**
   * Register a new user and create a record in the database
   */
  async registerUser(userData: RegisterUserDto): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Check if the role exists
      const role = await prisma.role.findUnique({
        where: { name: userData.roleName }
      });

      if (!role) {
        throw new Error(`Role ${userData.roleName} not found`);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create the user in the database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber,
          emailVerified: false,
          roleId: role.id,
          ...(userData.firebaseUid ? { firebaseUid: userData.firebaseUid } : {}),
        },
        include: {
          role: true,
        },
      });

      // Generate verification token and send email
      await this.sendVerificationEmail(user.email);

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name,
        } : null,
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login a user
   */
  async loginUser(loginData: LoginDto): Promise<LoginResponse> {
    try {
      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: { role: true },
      });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(loginData.password, user.password);
      
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role?.name
        }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      
      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          role: user.role ? {
            id: user.role.id,
            name: user.role.name,
          } : null,
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Update a user's email verification status
   */
  async updateEmailVerificationStatus(userId: string, isVerified: boolean): Promise<any> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: isVerified },
      });
    } catch (error) {
      console.error('Error updating email verification status:', error);
      throw error;
    }
  }

  /**
   * Send an email verification link
   */
  async sendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with verification token
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          resetToken: verificationToken,
          resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        },
      });

      // Create verification link
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      // In a real implementation, you would send this link via email
      console.log(`Email verification link for ${email}: ${verificationLink}`);
      
      // TODO: Send actual email
      // const transporter = nodemailer.createTransport({
      //   host: process.env.EMAIL_HOST,
      //   port: parseInt(process.env.EMAIL_PORT || '587'),
      //   secure: process.env.EMAIL_SECURE === 'true',
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS,
      //   },
      // });
      
      // await transporter.sendMail({
      //   from: process.env.EMAIL_FROM,
      //   to: email,
      //   subject: 'Verify your email',
      //   html: `<p>Please click the link below to verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      // });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Find user with this token and token not expired
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user email verification status
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          emailVerified: true,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // For security reasons, don't reveal if the email exists or not
      if (!user) {
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          resetToken: resetToken,
          resetTokenExpiry: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
        },
      });

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      // In a real implementation, you would send this link via email
      console.log(`Password reset link for ${email}: ${resetLink}`);
      
      // TODO: Send actual email
      // const transporter = nodemailer.createTransport({
      //   host: process.env.EMAIL_HOST,
      //   port: parseInt(process.env.EMAIL_PORT || '587'),
      //   secure: process.env.EMAIL_SECURE === 'true',
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS,
      //   },
      // });
      
      // await transporter.sendMail({
      //   from: process.env.EMAIL_FROM,
      //   to: email,
      //   subject: 'Reset your password',
      //   html: `<p>Please click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      // });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find user with this token and token not expired
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
} 
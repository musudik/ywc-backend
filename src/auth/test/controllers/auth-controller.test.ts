import { Request as ExpressRequest, Response } from 'express';
import { AuthController } from '../../controllers/auth-controller';
import { AuthService } from '../../services/auth-service';
import { PrismaClient } from '../../../../generated/prisma';

// Import the custom Request type that includes currentUser
import '../../types/express.d';

// Mock types to avoid dependency on actual packages
type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  profileImage: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  roleId: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  firebaseUid: string;
  role?: Role;
};

// Extend the Express Request interface for testing
interface Request extends ExpressRequest {
  currentUser?: User;
}

// Mock JsonWebToken types
class JsonWebTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

// Mock dependencies
jest.mock('../../../../generated/prisma', () => {
  const mockUpdate = jest.fn();
  const mockFindUnique = jest.fn();
  const mockFindFirst = jest.fn();
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        update: mockUpdate,
        findUnique: mockFindUnique,
        findFirst: mockFindFirst,
        create: jest.fn(),
        delete: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      $disconnect: jest.fn(),
    })),
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'user-123' }),
  JsonWebTokenError,
  TokenExpiredError
}));

jest.mock('../../services/auth-service');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockPrismaClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

    mockPrismaClient = new PrismaClient();

    // Setup request and response
    mockRequest = {
      body: {},
      currentUser: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authController = new AuthController();
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { email: 'test@example.com' }; // Missing password and roleName

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email, password, and role are required' });
    });

    it('should register a user successfully', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        roleName: 'CLIENT',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        displayName: null,
        phoneNumber: null,
        emailVerified: false,
        role: { id: '456', name: 'CLIENT' },
        firebaseUid: 'firebase-123',
      };

      // Create a spy on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'registerUser')
        .mockResolvedValueOnce(mockUser);
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      expect(AuthService.prototype.registerUser).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
      
      // Clean up the spy
      (AuthService.prototype.registerUser as jest.Mock).mockRestore();
    });

    it('should handle email already exists error', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        roleName: 'CLIENT',
      };

      const error = new Error('Email already in use');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'registerUser')
        .mockRejectedValueOnce(error);
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.registerUser as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });

    it('should handle role not found error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        roleName: 'INVALID_ROLE',
      };

      const error = new Error('Role INVALID_ROLE not found');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'registerUser')
        .mockRejectedValueOnce(error);
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.registerUser as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Role INVALID_ROLE not found' });
    });

    it('should handle generic error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        roleName: 'CLIENT',
      };

      const error = new Error('Generic error');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'registerUser')
        .mockRejectedValueOnce(error);
      
      await authController.register(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.registerUser as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Failed to register user', 
        error: 'Generic error' 
      });
    });
  });

  describe('login', () => {
    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { email: 'test@example.com' }; // Missing password

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    it('should login a user successfully', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockLoginResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          displayName: null,
          phoneNumber: null,
          emailVerified: false,
          role: { id: '456', name: 'CLIENT' },
          firebaseUid: 'firebase-123',
        },
        token: 'mock-jwt-token',
        expiresIn: '1d',
      };

      // Create a spy on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'loginUser')
        .mockResolvedValueOnce(mockLoginResponse);
      
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      expect(AuthService.prototype.loginUser).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLoginResponse);
      
      // Clean up the spy
      (AuthService.prototype.loginUser as jest.Mock).mockRestore();
    });

    it('should handle invalid credentials error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const error = new Error('Invalid email or password');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'loginUser')
        .mockRejectedValueOnce(error);
      
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.loginUser as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    it('should handle generic error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Generic login error');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'loginUser')
        .mockRejectedValueOnce(error);
      
      await authController.login(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.loginUser as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Failed to login', 
        error: 'Generic login error' 
      });
    });
  });

  describe('verifyEmail', () => {
    it('should return 400 if token is missing', async () => {
      mockRequest.body = {}; // Missing token

      await authController.verifyEmail(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Verification token is required' });
    });

    it('should verify email successfully', async () => {
      mockRequest.body = {
        token: 'valid-verification-token',
      };

      // Create a spy on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'verifyEmail')
        .mockResolvedValueOnce(true);
      
      await authController.verifyEmail(mockRequest as Request, mockResponse as Response);
      
      expect(AuthService.prototype.verifyEmail).toHaveBeenCalledWith('valid-verification-token');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email verified successfully' });
      
      // Clean up the spy
      (AuthService.prototype.verifyEmail as jest.Mock).mockRestore();
    });

    it('should handle invalid verification token error', async () => {
      mockRequest.body = {
        token: 'invalid-verification-token',
      };

      const error = new Error('Invalid or expired verification token');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'verifyEmail')
        .mockRejectedValueOnce(error);
      
      await authController.verifyEmail(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.verifyEmail as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired verification token' });
    });

    it('should handle generic error', async () => {
      mockRequest.body = {
        token: 'verification-token',
      };

      const error = new Error('Generic verification error');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'verifyEmail')
        .mockRejectedValueOnce(error);
      
      await authController.verifyEmail(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.verifyEmail as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Failed to verify email', 
        error: 'Generic verification error' 
      });
    });
  });

  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      mockRequest.body = {}; // Missing email

      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });

    it('should send password reset email successfully', async () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      // Create a spy on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'sendPasswordResetEmail')
        .mockResolvedValueOnce();
      
      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);
      
      expect(AuthService.prototype.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'If the email exists, a password reset link will be sent' 
      });
      
      // Clean up the spy
      (AuthService.prototype.sendPasswordResetEmail as jest.Mock).mockRestore();
    });

    it('should handle generic error', async () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      const error = new Error('Generic password reset error');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'sendPasswordResetEmail')
        .mockRejectedValueOnce(error);
      
      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.sendPasswordResetEmail as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Failed to send password reset email', 
        error: 'Generic password reset error' 
      });
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { token: 'reset-token' }; // Missing newPassword

      await authController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token and new password are required' });
    });

    it('should reset password successfully', async () => {
      mockRequest.body = {
        token: 'valid-reset-token',
        newPassword: 'new-password123',
      };

      // Create a spy on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'resetPassword')
        .mockResolvedValueOnce(true);
      
      await authController.resetPassword(mockRequest as Request, mockResponse as Response);
      
      expect(AuthService.prototype.resetPassword).toHaveBeenCalledWith('valid-reset-token', 'new-password123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
      
      // Clean up the spy
      (AuthService.prototype.resetPassword as jest.Mock).mockRestore();
    });

    it('should handle invalid reset token error', async () => {
      mockRequest.body = {
        token: 'invalid-reset-token',
        newPassword: 'new-password123',
      };

      const error = new Error('Invalid or expired reset token');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'resetPassword')
        .mockRejectedValueOnce(error);
      
      await authController.resetPassword(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.resetPassword as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired reset token' });
    });

    it('should handle generic error', async () => {
      mockRequest.body = {
        token: 'reset-token',
        newPassword: 'new-password123',
      };

      const error = new Error('Generic password reset error');
      
      // Create a spy directly on the AuthService prototype
      jest.spyOn(AuthService.prototype, 'resetPassword')
        .mockRejectedValueOnce(error);
      
      await authController.resetPassword(mockRequest as Request, mockResponse as Response);
      
      // Clean up the spy
      (AuthService.prototype.resetPassword as jest.Mock).mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Failed to reset password', 
        error: 'Generic password reset error' 
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return 401 if not authenticated', async () => {
      mockRequest.currentUser = undefined;

      await authController.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('should return user profile if authenticated', async () => {
      mockRequest.currentUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        phoneNumber: '+1234567890',
        emailVerified: true,
        profileImage: 'https://example.com/profile.jpg',
        firebaseUid: 'firebase-123',
        role: {
          id: '456',
          name: 'CLIENT',
          description: null,
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: '456',
        resetToken: null,
        resetTokenExpiry: null,
      };

      await authController.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        phoneNumber: '+1234567890',
        emailVerified: true,
        profileImage: 'https://example.com/profile.jpg',
        role: {
          id: '456',
          name: 'CLIENT',
        },
      });
    });

    it('should handle generic error', async () => {
      mockRequest.currentUser = {
        id: '123',
        email: 'test@example.com',
        role: {
          id: '456',
          name: 'CLIENT',
          description: null,
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        displayName: null,
        phoneNumber: null,
        emailVerified: false,
        profileImage: null,
        firebaseUid: 'firebase-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: '456',
        resetToken: null,
        resetTokenExpiry: null,
      };

      // Mock an error by making the response.json throw
      mockResponse.json = jest.fn().mockImplementation(() => {
        throw new Error('Generic user profile error');
      });

      await authController.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateProfile', () => {
    it('should return 401 if not authenticated', async () => {
      mockRequest.currentUser = undefined;
      mockRequest.body = {
        displayName: 'Updated Name',
        phoneNumber: '+9876543210',
        profileImage: 'https://example.com/new-profile.jpg',
      };

      await authController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('should update user profile successfully', async () => {
      mockRequest.currentUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Old Name',
        phoneNumber: '+1234567890',
        profileImage: 'https://example.com/old-profile.jpg',
        emailVerified: true,
        firebaseUid: 'firebase-123',
        role: {
          id: '456',
          name: 'CLIENT',
          description: null,
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: '456',
        resetToken: null,
        resetTokenExpiry: null,
      };

      mockRequest.body = {
        displayName: 'Updated Name',
        phoneNumber: '+9876543210',
        profileImage: 'https://example.com/new-profile.jpg',
      };

      const updatedUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Updated Name',
        phoneNumber: '+9876543210',
        profileImage: 'https://example.com/new-profile.jpg',
        emailVerified: true,
        firebaseUid: 'firebase-123',
        role: {
          id: '456',
          name: 'CLIENT',
          description: null,
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: '456',
        resetToken: null,
        resetTokenExpiry: null,
      };

      (mockPrismaClient.user.update as jest.Mock).mockResolvedValueOnce(updatedUser);

      await authController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          displayName: 'Updated Name',
          phoneNumber: '+9876543210',
          profileImage: 'https://example.com/new-profile.jpg',
        },
        include: { role: true },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: '123',
        email: 'test@example.com',
        displayName: 'Updated Name',
        phoneNumber: '+9876543210',
        emailVerified: true,
        profileImage: 'https://example.com/new-profile.jpg',
        role: {
          id: '456',
          name: 'CLIENT',
        },
      });
    });

    it('should handle update error', async () => {
      mockRequest.currentUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Old Name',
        phoneNumber: '+1234567890',
        profileImage: 'https://example.com/old-profile.jpg',
        emailVerified: true,
        firebaseUid: 'firebase-123',
        role: {
          id: '456',
          name: 'CLIENT',
          description: null,
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: '456',
        resetToken: null,
        resetTokenExpiry: null,
      };

      mockRequest.body = {
        displayName: 'Updated Name',
        phoneNumber: '+9876543210',
        profileImage: 'https://example.com/new-profile.jpg',
      };

      const error = new Error('Database update error');
      (mockPrismaClient.user.update as jest.Mock).mockRejectedValueOnce(error);

      await authController.updateProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Failed to update profile', 
        error: 'Database update error'
      });
    });
  });
}); 
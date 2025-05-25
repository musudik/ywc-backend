import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'Missing');
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    
    try {
      // Verify the JWT token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;
      console.log('Decoded token:', JSON.stringify(decodedToken, null, 2));
      
      if (!decodedToken.userId) {
        console.log('No userId in token');
        res.status(401).json({ message: 'Invalid token payload' });
        return;
      }
      
      // Get the user from the database
      console.log('Looking for user with ID:', decodedToken.userId);
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.userId },
        include: { role: true }
      });
      
      if (!user) {
        console.log('User not found in database');
        res.status(401).json({ message: 'User not found' });
        return;
      }
      
      console.log('Found user:', user.email, 'with role:', user.role?.name);
      
      // Add user info to request
      req.currentUser = {
        id: user.id,
        email: user.email,
        role: user.role?.name || 'user',
      };
      
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

// Basic auth middleware - this should be enhanced with proper JWT validation
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // For now, we'll add a mock user ID to the request using the seeded admin user
  // In a real implementation, this would validate JWT tokens and extract user info
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // For development, we'll allow requests without auth but add the seeded admin user
    (req as any).user = {
      id: '387b2f0e-218d-46bf-8bf6-8aa3d53acd00', // Admin user ID from seed
      email: 'master@yourwealth.coach',
      role: 'admin'
    };
    return next();
  }
  
  // TODO: Implement proper JWT validation here
  // For now, just add the seeded admin user
  (req as any).user = {
    id: '387b2f0e-218d-46bf-8bf6-8aa3d53acd00', // Admin user ID from seed
    email: 'master@yourwealth.coach',
    role: 'admin'
  };
  
  next();
};

// Admin role check middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // TODO: Check if user has admin role from database
  // For now, we'll assume all authenticated users are admins
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}; 
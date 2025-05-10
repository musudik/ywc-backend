import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }
    
    try {
      // Verify the JWT token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as jwt.JwtPayload;
      
      if (!decodedToken.userId) {
        res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
        return;
      }
      
      // Get the user from the database
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.userId },
        include: { role: true }
      });
      
      if (!user) {
        res.status(401).json({ message: 'Unauthorized: User not found' });
        return;
      }
      
      // Store the full user with role in the request
      req.currentUser = user;
      
      // Continue to the next middleware/route handler
      next();
      return;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
      } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Unauthorized: Token expired' });
      } else {
        res.status(401).json({ message: 'Unauthorized: Token validation failed' });
      }
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.currentUser) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  next();
  return;
};

// Middleware to check if user has required role
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.currentUser) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!req.currentUser.role || !roles.includes(req.currentUser.role.name)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }
    
    next();
    return;
  };
}; 
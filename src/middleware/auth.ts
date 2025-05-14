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
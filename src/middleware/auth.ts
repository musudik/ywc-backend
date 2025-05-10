import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    
    // Add user info to request
    req.currentUser = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'user',
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 
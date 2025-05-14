import { User } from '../../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
} 
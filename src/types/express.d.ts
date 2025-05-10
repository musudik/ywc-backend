import { User } from '@prisma/client';

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
import { Role, User } from '../../../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      currentUser?: any; // Using any type to bypass strict type checking for tests
    }
  }
} 
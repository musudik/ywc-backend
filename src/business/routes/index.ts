import { Router } from 'express';
import clientDataRoutes from './client-data.routes';
import personalDetailsRoutes from './personal-details.routes';
import profileCompletionRoutes from './profile-completion.routes';

const router = Router();

// Mount routes
router.use('/client-data', clientDataRoutes);
router.use('/personal-details', personalDetailsRoutes);
router.use('/profile', profileCompletionRoutes);

export default router; 
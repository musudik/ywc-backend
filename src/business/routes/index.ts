import { Router } from 'express';
import clientDataRoutes from './client-data.routes';
import personalDetailsRoutes from './personal-details.routes';

const router = Router();

// Mount routes
router.use('/client-data', clientDataRoutes);
router.use('/personal-details', personalDetailsRoutes);

export default router; 
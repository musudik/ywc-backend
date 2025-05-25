import { Router } from 'express';
import formConfigurationRoutes from './form-configuration.routes';

const router = Router();

// Register admin routes
router.use('/form-configurations', formConfigurationRoutes);

export default router; 
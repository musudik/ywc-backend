import { Router } from 'express';
import immobilienRoutes from './immobilien/immobilien.routes';
import privateHealthInsuranceRoutes from './privateHealthInsurance/private-health-insurance.routes';
import stateHealthInsuranceRoutes from './stateHealthInsurance/state-health-insurance.routes';
import kfzRoutes from './kfz/kfz.routes';
import loansRoutes from './loans/loans.routes';
import analysisRoutes from './master/analysis-form.routes';

const router = Router();

// Register all form routes
router.use('/immobilien', immobilienRoutes);
router.use('/privateHealthInsurance', privateHealthInsuranceRoutes);
router.use('/stateHealthInsurance', stateHealthInsuranceRoutes);
router.use('/kfz', kfzRoutes);
router.use('/loans', loansRoutes);
router.use('/analysis', analysisRoutes);

export default router; 
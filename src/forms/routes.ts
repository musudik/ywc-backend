import { Router } from 'express';
import immobilienRoutes from './immobilien/immobilien.routes';
import privateHealthInsuranceRoutes from './privateHealthInsurance/private-health-insurance.routes';
import stateHealthInsuranceRoutes from './stateHealthInsurance/state-health-insurance.routes';
import kfzRoutes from './kfz/kfz.routes';
import loansRoutes from './loans/loans.routes';
import analysisRoutes from './master/analysis-form.routes';
import clientFormRoutes from './client-forms/client-form.routes';
import masterDataRoutes from './master-data/master-data.routes';
import immobilienDataRoutes from './master-data/immobilien-data.routes';

const router = Router();

// Register all form routes
router.use('/immobilien', immobilienRoutes);
router.use('/privateHealthInsurance', privateHealthInsuranceRoutes);
router.use('/stateHealthInsurance', stateHealthInsuranceRoutes);
router.use('/kfz', kfzRoutes);
router.use('/loans', loansRoutes);
router.use('/analysis', analysisRoutes);
router.use('/client-forms', clientFormRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/immobilien-data', immobilienDataRoutes);

export default router; 
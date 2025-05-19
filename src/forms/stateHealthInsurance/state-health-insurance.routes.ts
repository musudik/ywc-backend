import { Router } from 'express';
import { StateHealthInsuranceController } from './state-health-insurance.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const stateHealthInsuranceController = new StateHealthInsuranceController();

// Create a new state health insurance form
router.post('/', authenticate, stateHealthInsuranceController.create.bind(stateHealthInsuranceController));

// Get all state health insurance forms for the current user
router.get('/', authenticate, stateHealthInsuranceController.getAll.bind(stateHealthInsuranceController));

// Get a specific state health insurance form
router.get('/:id', authenticate, stateHealthInsuranceController.getOne.bind(stateHealthInsuranceController));

// Update a state health insurance form
router.put('/:id', authenticate, stateHealthInsuranceController.update.bind(stateHealthInsuranceController));

// Delete a state health insurance form
router.delete('/:id', authenticate, stateHealthInsuranceController.delete.bind(stateHealthInsuranceController));

// Update form status
router.patch('/:id/status', authenticate, stateHealthInsuranceController.updateStatus.bind(stateHealthInsuranceController));

export default router; 
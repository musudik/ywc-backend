import { Router } from 'express';
import { PrivateHealthInsuranceController } from './private-health-insurance.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const privateHealthInsuranceController = new PrivateHealthInsuranceController();

// Create a new private health insurance form
router.post('/', authenticate, privateHealthInsuranceController.create.bind(privateHealthInsuranceController));

// Get all private health insurance forms for the current user
router.get('/', authenticate, privateHealthInsuranceController.getAll.bind(privateHealthInsuranceController));

// Get a specific private health insurance form
router.get('/:id', authenticate, privateHealthInsuranceController.getOne.bind(privateHealthInsuranceController));

// Update a private health insurance form
router.put('/:id', authenticate, privateHealthInsuranceController.update.bind(privateHealthInsuranceController));

// Delete a private health insurance form
router.delete('/:id', authenticate, privateHealthInsuranceController.delete.bind(privateHealthInsuranceController));

// Update form status
router.patch('/:id/status', authenticate, privateHealthInsuranceController.updateStatus.bind(privateHealthInsuranceController));

export default router; 
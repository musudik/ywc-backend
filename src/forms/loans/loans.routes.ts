import { Router } from 'express';
import { LoansController } from './loans.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const loansController = new LoansController();

// Create a new loans form
router.post('/', authenticate, loansController.create.bind(loansController));

// Get all loans forms for the current user
router.get('/', authenticate, loansController.getAll.bind(loansController));

// Get a specific loans form
router.get('/:id', authenticate, loansController.getOne.bind(loansController));

// Update a loans form
router.put('/:id', authenticate, loansController.update.bind(loansController));

// Delete a loans form
router.delete('/:id', authenticate, loansController.delete.bind(loansController));

// Update form status
router.patch('/:id/status', authenticate, loansController.updateStatus.bind(loansController));

export default router; 
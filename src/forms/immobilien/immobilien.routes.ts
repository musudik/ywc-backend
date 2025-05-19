import { Router } from 'express';
import { ImmobilienController } from './immobilien.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const immobilienController = new ImmobilienController();

// Create a new immobilien form
router.post('/', authenticate, immobilienController.create.bind(immobilienController));

// Get all immobilien forms for the current user
router.get('/', authenticate, immobilienController.getAll.bind(immobilienController));

// Get a specific immobilien form
router.get('/:id', authenticate, immobilienController.getOne.bind(immobilienController));

// Update an immobilien form
router.put('/:id', authenticate, immobilienController.update.bind(immobilienController));

// Delete an immobilien form
router.delete('/:id', authenticate, immobilienController.delete.bind(immobilienController));

// Update form status
router.patch('/:id/status', authenticate, immobilienController.updateStatus.bind(immobilienController));

export default router; 
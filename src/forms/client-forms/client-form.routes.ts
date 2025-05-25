import { Router } from 'express';
import { ClientFormController } from './client-form.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const clientFormController = new ClientFormController();

// Create a new client form
router.post('/', authenticate, clientFormController.create.bind(clientFormController));

// Get all client forms for the current user
router.get('/', authenticate, clientFormController.getAll.bind(clientFormController));

// Get a specific client form
router.get('/:id', authenticate, clientFormController.getOne.bind(clientFormController));

// Update a client form
router.put('/:id', authenticate, clientFormController.update.bind(clientFormController));

// Delete a client form
router.delete('/:id', authenticate, clientFormController.delete.bind(clientFormController));

// Update form status
router.patch('/:id/status', authenticate, clientFormController.updateStatus.bind(clientFormController));

// Clean up duplicate forms (admin only)
router.post('/cleanup-duplicates', authenticate, clientFormController.cleanupDuplicates.bind(clientFormController));

export default router; 
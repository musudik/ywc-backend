import { Router } from 'express';
import { KfzController } from './kfz.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const kfzController = new KfzController();

// Create a new KFZ form
router.post('/', authenticate, kfzController.create.bind(kfzController));

// Get all KFZ forms for the current user
router.get('/', authenticate, kfzController.getAll.bind(kfzController));

// Get a specific KFZ form
router.get('/:id', authenticate, kfzController.getOne.bind(kfzController));

// Update a KFZ form
router.put('/:id', authenticate, kfzController.update.bind(kfzController));

// Delete a KFZ form
router.delete('/:id', authenticate, kfzController.delete.bind(kfzController));

// Update form status
router.patch('/:id/status', authenticate, kfzController.updateStatus.bind(kfzController));

export default router; 
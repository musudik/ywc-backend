import { Router } from 'express';
import { FormConfigurationController } from './form-configuration.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// Form Configuration routes
router.get('/', FormConfigurationController.getAllConfigurations);
router.get('/types', FormConfigurationController.getFormTypes);
router.get('/section-fields', FormConfigurationController.getSectionFields);
router.post('/validate', FormConfigurationController.validateConfiguration);
router.get('/:id', FormConfigurationController.getConfigurationById);
router.post('/', FormConfigurationController.createConfiguration);
router.put('/:id', FormConfigurationController.updateConfiguration);
router.delete('/:id', FormConfigurationController.deleteConfiguration);
router.post('/:id/duplicate', FormConfigurationController.duplicateConfiguration);
router.patch('/:id/toggle-status', FormConfigurationController.toggleStatus);
router.get('/:id/export', FormConfigurationController.exportConfiguration);
router.get('/:id/stats', FormConfigurationController.getConfigurationStats);

export default router; 
import { Router } from 'express';
import { AnalysisFormController } from './analysis-form.controller';
import { authenticate } from '../../auth/middlewares/authenticate';

const router = Router();
const analysisFormController = new AnalysisFormController();

// Create a new analysis form
router.post('/', authenticate, analysisFormController.create.bind(analysisFormController));

// Get all analysis forms for the current user
router.get('/', authenticate, analysisFormController.getAll.bind(analysisFormController));

// Get a specific analysis form
router.get('/:id', authenticate, analysisFormController.getOne.bind(analysisFormController));

// Update an analysis form
router.put('/:id', authenticate, analysisFormController.update.bind(analysisFormController));

// Delete an analysis form
router.delete('/:id', authenticate, analysisFormController.delete.bind(analysisFormController));

// Update form status
router.patch('/:id/status', authenticate, analysisFormController.updateStatus.bind(analysisFormController));

export default router; 
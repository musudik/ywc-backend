import { Router } from 'express';
import { ProfileCompletionController } from '../controllers/profile-completion.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new ProfileCompletionController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Profile completion status route
router.get('/completion-status', controller.getCompletionStatus.bind(controller));

export default router; 
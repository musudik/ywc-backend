import { Router } from 'express';
import { PersonalDetailsController } from '../controllers/personal-details.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new PersonalDetailsController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Personal Details routes
router.post('/', controller.create.bind(controller));
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router; 
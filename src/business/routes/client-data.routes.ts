import { Router } from 'express';
import { ClientDataController } from '../controllers/client-data.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const controller = new ClientDataController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Employment routes
router.post('/employment', controller.createEmployment.bind(controller));
router.get('/employment/:personalId', controller.getEmployments.bind(controller));
router.put('/employment/:id', controller.updateEmployment.bind(controller));
router.delete('/employment/:id', controller.deleteEmployment.bind(controller));

// Income routes
router.post('/income', controller.createIncome.bind(controller));
router.get('/income/:personalId', controller.getIncomes.bind(controller));
router.put('/income/:id', controller.updateIncome.bind(controller));
router.delete('/income/:id', controller.deleteIncome.bind(controller));

// Expenses routes
router.post('/expenses', controller.createExpenses.bind(controller));
router.get('/expenses/:personalId', controller.getExpenses.bind(controller));
router.put('/expenses/:id', controller.updateExpenses.bind(controller));
router.delete('/expenses/:id', controller.deleteExpenses.bind(controller));

// Asset routes
router.post('/asset', controller.createAsset.bind(controller));
router.get('/asset/:personalId', controller.getAssets.bind(controller));
router.put('/asset/:id', controller.updateAsset.bind(controller));
router.delete('/asset/:id', controller.deleteAsset.bind(controller));

// Liability routes
router.post('/liability', controller.createLiability.bind(controller));
router.get('/liability/:personalId', controller.getLiabilities.bind(controller));
router.put('/liability/:id', controller.updateLiability.bind(controller));
router.delete('/liability/:id', controller.deleteLiability.bind(controller));

// Goals and Wishes routes
router.post('/goals-wishes', controller.createGoalsAndWishes.bind(controller));
router.get('/goals-wishes/:personalId', controller.getGoalsAndWishes.bind(controller));
router.put('/goals-wishes/:id', controller.updateGoalsAndWishes.bind(controller));
router.delete('/goals-wishes/:id', controller.deleteGoalsAndWishes.bind(controller));

// Risk Appetite routes
router.post('/risk-appetite', controller.createRiskAppetite.bind(controller));
router.get('/risk-appetite/:personalId', controller.getRiskAppetite.bind(controller));
router.put('/risk-appetite/:id', controller.updateRiskAppetite.bind(controller));
router.delete('/risk-appetite/:id', controller.deleteRiskAppetite.bind(controller));

// Consent routes
router.post('/consent', controller.createConsent.bind(controller));
router.get('/consent/:personalId', controller.getConsents.bind(controller));
router.put('/consent/:id', controller.updateConsent.bind(controller));
router.delete('/consent/:id', controller.deleteConsent.bind(controller));

// Document routes
router.post('/document', controller.createDocument.bind(controller));
router.get('/document/:personalId', controller.getDocuments.bind(controller));
router.put('/document/:id', controller.updateDocument.bind(controller));
router.delete('/document/:id', controller.deleteDocument.bind(controller));

// Form routes
router.post('/form', controller.createForm.bind(controller));
router.get('/form/:personalId', controller.getForms.bind(controller));
router.put('/form/:id', controller.updateForm.bind(controller));
router.delete('/form/:id', controller.deleteForm.bind(controller));

// Custom Form routes
router.post('/custom-form', controller.createCustomForm.bind(controller));
router.get('/custom-form/:personalId', controller.getCustomForms.bind(controller));
router.put('/custom-form/:id', controller.updateCustomForm.bind(controller));
router.delete('/custom-form/:id', controller.deleteCustomForm.bind(controller));

export default router; 
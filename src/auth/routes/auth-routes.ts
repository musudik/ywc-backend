import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { authenticate, requireAuth } from '../middlewares/authenticate';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));
router.put('/profile', authenticate, requireAuth, authController.updateProfile.bind(authController));

export { router as authRoutes }; 
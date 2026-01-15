import { Router } from 'express';
import {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  verifyAccount,
  verifyToken,
  refreshToken,
} from '../controllers/authController';
import { verifyToken as authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-account', verifyAccount);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/verify-token', authMiddleware, verifyToken);

export default router;

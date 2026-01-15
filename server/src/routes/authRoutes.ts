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
import {
  validateSignup,
  validateSignin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyAccount,
  validateRefreshToken,
  handleValidationErrors,
} from '../middleware/validation';
import {
  strictLimiter,
  moderateLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verifyAccountLimiter,
  refreshTokenLimiter,
} from '../middleware/rateLimit';
import { asyncHandler } from '../utils/errors';

const router = Router();

// Public routes with rate limiting and validation
// Rate limiting is applied first, then validation, then controller
// asyncHandler wraps controllers to catch errors and pass to error handler
router.post('/signin', strictLimiter, validateSignin, handleValidationErrors, asyncHandler(signin));
router.post('/signup', moderateLimiter, validateSignup, handleValidationErrors, asyncHandler(signup));
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, handleValidationErrors, asyncHandler(forgotPassword));
router.get('/reset-password', resetPasswordLimiter, validateResetPassword, handleValidationErrors, asyncHandler(resetPassword));
router.post('/reset-password', resetPasswordLimiter, validateResetPassword, handleValidationErrors, asyncHandler(resetPassword));
router.get('/verify-account', verifyAccountLimiter, validateVerifyAccount, handleValidationErrors, asyncHandler(verifyAccount));
router.post('/refresh-token', refreshTokenLimiter, validateRefreshToken, handleValidationErrors, asyncHandler(refreshToken));

// Protected routes (no rate limiting needed - already authenticated)
router.get('/verify-token', authMiddleware, asyncHandler(verifyToken));

export default router;

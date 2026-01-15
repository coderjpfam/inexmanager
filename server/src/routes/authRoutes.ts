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
import { requestDeduplication } from '../middleware/deduplication';
import { csrfProtection } from '../middleware/csrf';
import { asyncHandler } from '../utils/errors';

const router = Router();

// Public routes with rate limiting and validation
// Rate limiting is applied first, then validation, then controller
// asyncHandler wraps controllers to catch errors and pass to error handler

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: Sign in user
 *     description: Authenticate a user with email and password. Returns JWT access token and refresh token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   name: "John Doe"
 *                   email: "user@example.com"
 *                   profilePath: ""
 *                   currency: "USD"
 *                   isVerified: true
 *                   createdAt: "2024-01-15T10:00:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - field: "email"
 *                   message: "Email is required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Invalid email or password"
 *               requestId: "550e8400-e29b-41d4-a716-446655440000"
 */
router.post('/signin', strictLimiter, requestDeduplication(2000), validateSignin, handleValidationErrors, asyncHandler(signin));

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Sign up new user
 *     description: Create a new user account. An email verification link will be sent to the provided email address.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             name: "John Doe"
 *             email: "user@example.com"
 *             password: "SecurePass123!"
 *             confirmPassword: "SecurePass123!"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "User created successfully. Please check your email for verification."
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   name: "John Doe"
 *                   email: "user@example.com"
 *                   profilePath: ""
 *                   currency: "USD"
 *                   isVerified: false
 *                   createdAt: "2024-01-15T10:00:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - field: "password"
 *                   message: "Password must be at least 8 characters long"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "User with this email already exists"
 *               requestId: "550e8400-e29b-41d4-a716-446655440000"
 */
router.post('/signup', moderateLimiter, requestDeduplication(2000), validateSignup, handleValidationErrors, asyncHandler(signup));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', forgotPasswordLimiter, requestDeduplication(5000), validateForgotPassword, handleValidationErrors, asyncHandler(forgotPassword));

/**
 * @swagger
 * /api/auth/reset-password:
 *   get:
 *     summary: Get reset password page (redirects to reset password form)
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email
 *     responses:
 *       200:
 *         description: Reset password page
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Validation error or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reset-password', resetPasswordLimiter, validateResetPassword, handleValidationErrors, asyncHandler(resetPassword));
router.post('/reset-password', resetPasswordLimiter, requestDeduplication(2000), validateResetPassword, handleValidationErrors, asyncHandler(resetPassword));

/**
 * @swagger
 * /api/auth/verify-account:
 *   get:
 *     summary: Verify user account
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token from email
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account verified successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify-account', verifyAccountLimiter, validateVerifyAccount, handleValidationErrors, asyncHandler(verifyAccount));

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh-token', refreshTokenLimiter, validateRefreshToken, handleValidationErrors, asyncHandler(refreshToken));

// Protected routes (no rate limiting needed - already authenticated)
/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     summary: Verify access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token is valid
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify-token', authMiddleware, asyncHandler(verifyToken));

export default router;

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Token from '../models/Token';
import { sendTemplatedEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import { logError, logWarning } from '../utils/logger';

interface SignupRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    profileImage?: string;
  };
}

interface SigninRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

interface ResetPasswordRequest extends Request {
  body: {
    password: string;
    confirmPassword: string;
  };
}

interface VerifyAccountRequest extends Request {
  query: {
    token?: string;
  };
}

// Helper function to get JWT secret (validated at startup)
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

// Helper function to get JWT refresh secret (validated at startup)
const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return secret;
};

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign({ userId, email }, secret, { expiresIn } as jwt.SignOptions);
};

// Helper function to generate refresh token
const generateRefreshToken = (userId: string, email: string): string => {
  const secret = getJwtRefreshSecret();
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ userId, email }, secret, { expiresIn } as jwt.SignOptions);
};

// 1. Signup
export const signup = async (req: SignupRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, profileImage } = req.body;

    // Note: Input validation is handled by express-validator middleware
    // All inputs are already validated, sanitized, and normalized at this point

    // Check if user already exists (optimized query - only check email)
    const existingUser = await User.findOne({ email: email.toLowerCase() })
      .select('email')
      .lean();
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with initial password in history
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePath: profileImage || '',
      isVerified: false,
      passwordHistory: [
        {
          password: hashedPassword,
          changedAt: new Date(),
        },
      ],
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

    // Generate verification token
    const verifyToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    // Store verification token in database
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // 24 hours from now

    await Token.create({
      token: verifyToken,
      type: 'email-verification',
      userId: user._id,
      used: false,
      expiresAt: tokenExpiresAt,
    });

    const verifyLink = `${process.env.CLIENT_URL}/auth/verify-account?token=${verifyToken}`;

    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:8081';
      await sendTemplatedEmail('verify-account', user.email, [
        { key: 'name', value: user.name },
        { key: 'verifyLink', value: verifyLink },
        { key: 'supportEmail', value: process.env.SUPPORT_EMAIL || 'support@inexmanager.com' },
        { key: 'facebookLink', value: process.env.FACEBOOK_LINK || '#' },
        { key: 'twitterLink', value: process.env.TWITTER_LINK || '#' },
        { key: 'instagramLink', value: process.env.INSTAGRAM_LINK || '#' },
        { key: 'companyAddress', value: process.env.COMPANY_ADDRESS || '123 Finance Street, Money City, FC 12345' },
        { key: 'privacyPolicyLink', value: `${clientUrl}/privacy-policy` },
        { key: 'termsLink', value: `${clientUrl}/terms-of-service` },
        { key: 'unsubscribeLink', value: `${clientUrl}/unsubscribe` },
      ]);
    } catch (emailError: unknown) {
      logError('Error sending verification email', emailError, { requestId: (req as any).requestId });
      // Continue even if email fails
    }

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePath: user.profilePath,
      currency: user.currency,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email for verification.',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to create user account');
  }
};

// 2. Signin
export const signin = async (req: SigninRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Note: Input validation is handled by express-validator middleware
    // All inputs are already validated, sanitized, and normalized at this point

    // Find user (optimized query - only select needed fields)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('_id email password name profilePath currency isVerified createdAt');
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePath: user.profilePath,
      currency: user.currency,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to sign in');
  }
};

// 3. Forgot Password
export const forgotPassword = async (
  req: ForgotPasswordRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Note: Input validation is handled by express-validator middleware
    // All inputs are already validated, sanitized, and normalized at this point

    // Find user (optimized query - only check if exists, don't load full document)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('_id email name')
      .lean();
    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    // Store reset token in database
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1); // 1 hour from now

    await Token.create({
      token: resetToken,
      type: 'password-reset',
      userId: user._id,
      used: false,
      expiresAt: tokenExpiresAt,
    });

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    // Send reset password email
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:8081';
      await sendTemplatedEmail('reset-password', user.email, [
        { key: 'name', value: user.name },
        { key: 'resetLink', value: resetLink },
        { key: 'supportEmail', value: process.env.SUPPORT_EMAIL || 'support@inexmanager.com' },
        { key: 'facebookLink', value: process.env.FACEBOOK_LINK || '#' },
        { key: 'twitterLink', value: process.env.TWITTER_LINK || '#' },
        { key: 'instagramLink', value: process.env.INSTAGRAM_LINK || '#' },
        { key: 'companyAddress', value: process.env.COMPANY_ADDRESS || '123 Finance Street, Money City, FC 12345' },
        { key: 'privacyPolicyLink', value: `${clientUrl}/privacy-policy` },
        { key: 'termsLink', value: `${clientUrl}/terms-of-service` },
        { key: 'unsubscribeLink', value: `${clientUrl}/unsubscribe` },
      ]);
    } catch (emailError: unknown) {
      // Email sending failed, but don't expose error details
      // Log for debugging but continue with success response for security
      logError('Error sending reset password email', emailError, { requestId: (req as any).requestId });
      throw new AppError(500, 'Failed to send reset password email');
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to process password reset request');
  }
};

// 4. Reset Password
export const resetPassword = async (
  req: ResetPasswordRequest,
  res: Response
): Promise<void> => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.query.token as string;

    // Note: Input validation is handled by express-validator middleware
    // All inputs are already validated, sanitized, and normalized at this point

    // Verify token and get email
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, getJwtSecret()) as {
        userId: string;
        email: string;
      };
    } catch (error: unknown) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    // Check if token has been used
    const tokenRecord = await Token.findOne({
      token,
      type: 'password-reset',
      used: false,
    });

    if (!tokenRecord) {
      throw new AuthenticationError('Invalid or already used reset token');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new AuthenticationError('Reset token has expired');
    }

    // Find user with password history
    const user = await User.findOne({ email: decoded.email }).select('+passwordHistory');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check password history (prevent reusing last 5 passwords)
    const passwordHistorySize = 5;
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      for (const oldPasswordEntry of user.passwordHistory.slice(-passwordHistorySize)) {
        const isSamePassword = await bcrypt.compare(password, oldPasswordEntry.password);
        if (isSamePassword) {
          throw new ValidationError('You cannot reuse a recently used password. Please choose a different password.');
        }
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and add to history
    const currentPassword = user.password;
    user.password = hashedPassword;
    
    // Add current password to history
    if (!user.passwordHistory) {
      user.passwordHistory = [];
    }
    user.passwordHistory.push({
      password: currentPassword,
      changedAt: new Date(),
    });
    
    // Keep only last 5 passwords
    if (user.passwordHistory.length > passwordHistorySize) {
      user.passwordHistory = user.passwordHistory.slice(-passwordHistorySize);
    }
    
    await user.save();

    // Mark token as used
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to reset password');
  }
};

// 5. Verify Account
export const verifyAccount = async (
  req: VerifyAccountRequest,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;

    // Note: Input validation is handled by express-validator middleware
    // All inputs are already validated, sanitized, and normalized at this point

    // Verify token and get email
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token as string, getJwtSecret()) as {
        userId: string;
        email: string;
      };
    } catch (error: unknown) {
      throw new AuthenticationError('Invalid or expired verification token');
    }

    // Check if token has been used
    const tokenRecord = await Token.findOne({
      token: token as string,
      type: 'email-verification',
      used: false,
    });

    if (!tokenRecord) {
      throw new AuthenticationError('Invalid or already used verification token');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new AuthenticationError('Verification token has expired');
    }

    // Find user (optimized query - only select needed fields)
    const user = await User.findOne({ email: decoded.email })
      .select('_id email name profilePath currency isVerified createdAt')
      .lean();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(200).json({
        success: true,
        message: 'Account is already verified',
      });
      return;
    }

    // Update verification status
    user.isVerified = true;
    await user.save();

    // Mark token as used
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await tokenRecord.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to verify account');
  }
};

// 6. Verify Token
export const verifyToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If we reach here, token is already verified by middleware
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
      },
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to verify token');
  }
};

// 7. Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Note: Input validation is handled by express-validator middleware
    // All inputs are already validated, sanitized, and normalized at this point

    // Verify refresh token
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(refreshToken, getJwtRefreshSecret()) as {
        userId: string;
        email: string;
      };
    } catch (error: unknown) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Generate new access token
    const newToken = generateToken(decoded.userId, decoded.email);
    const newRefreshToken = generateRefreshToken(decoded.userId, decoded.email);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: unknown) {
    // If it's already an AppError, re-throw it (will be handled by error handler)
    if (error instanceof AppError) {
      throw error;
    }
    // For unexpected errors, wrap in AppError
    throw new AppError(500, 'Failed to refresh token');
  }
};

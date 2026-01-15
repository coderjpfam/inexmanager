import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { sendTemplatedEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';

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

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

// Helper function to generate refresh token
const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

// 1. Signup
export const signup = async (req: SignupRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, profileImage } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePath: profileImage || '',
      isVerified: false,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

    // Send verification email
    const verifyToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

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
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
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
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// 2. Signin
export const signin = async (req: SigninRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
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
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// 3. Forgot Password
export const forgotPassword = async (
  req: ForgotPasswordRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
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
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

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
    } catch (emailError) {
      console.error('Error sending reset password email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send reset password email',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
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

    // Validation
    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
      return;
    }

    if (!password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide password and confirm password',
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Verify token and get email
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// 5. Verify Account
export const verifyAccount = async (
  req: VerifyAccountRequest,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
      return;
    }

    // Verify token and get email
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
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

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
    });
  } catch (error: any) {
    console.error('Verify account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
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
  } catch (error: any) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// 7. Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
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
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

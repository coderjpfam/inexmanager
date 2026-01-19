import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../schemas/user.schema';
import { Token, TokenDocument } from '../schemas/token.schema';
import { EmailService } from '../common/services/email.service';
import {
  ConflictException,
  AuthenticationException,
  NotFoundException,
  ValidationException,
  AppException,
} from '../common/exceptions/app.exception';
import { logError } from '../config/winston.config';
import { AppConfig, EmailConfig } from '../config/app.config';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private appConfig: AppConfig;
  private emailConfig: EmailConfig;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.appConfig = this.configService.get<AppConfig>('config.app')!;
    this.emailConfig = this.configService.get<EmailConfig>('config.email')!;
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    return secret;
  }

  private getJwtRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return secret;
  }

  private generateToken(userId: string, email: string): string {
    const secret = this.getJwtSecret();
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    return jwt.sign({ userId, email }, secret, { expiresIn } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: string, email: string): string {
    const secret = this.getJwtRefreshSecret();
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    return jwt.sign({ userId, email }, secret, { expiresIn } as jwt.SignOptions);
  }

  async signup(signupDto: SignupDto) {
    try {
      const { name, email, password, profileImage } = signupDto;

      // Check if user already exists
      const existingUser = await this.userModel
        .findOne({ email: email.toLowerCase() })
        .select('email')
        .lean();
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with initial password in history
      const user = new this.userModel({
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

      // Generate JWT tokens
      const token = this.generateToken(user._id.toString(), user.email);
      const refreshToken = this.generateRefreshToken(
        user._id.toString(),
        user.email,
      );

      // Generate verification token
      const verifyToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        this.getJwtSecret(),
        { expiresIn: '24h' },
      );

      // Store verification token in database
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

      await this.tokenModel.create({
        token: verifyToken,
        type: 'email-verification',
        userId: user._id,
        used: false,
        expiresAt: tokenExpiresAt,
      });

      const verifyLink = `${this.appConfig.clientUrl}/auth/verify-account?token=${verifyToken}`;

      // Send verification email
      try {
        const clientUrl = this.appConfig.clientUrl;
        await this.emailService.sendTemplatedEmail('verify-account', user.email, [
          { key: 'name', value: user.name },
          { key: 'verifyLink', value: verifyLink },
          {
            key: 'supportEmail',
            value: this.emailConfig.supportEmail,
          },
          { key: 'facebookLink', value: this.emailConfig.facebookLink },
          { key: 'twitterLink', value: this.emailConfig.twitterLink },
          { key: 'instagramLink', value: this.emailConfig.instagramLink },
          {
            key: 'companyAddress',
            value: this.emailConfig.companyAddress,
          },
          { key: 'privacyPolicyLink', value: `${clientUrl}/privacy-policy` },
          { key: 'termsLink', value: `${clientUrl}/terms-of-service` },
          { key: 'unsubscribeLink', value: `${clientUrl}/unsubscribe` },
        ]);
      } catch (emailError: unknown) {
        logError('Error sending verification email', emailError);
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

      return {
        success: true,
        message:
          'User created successfully. Please check your email for verification.',
        data: {
          user: userResponse,
          token,
          refreshToken,
        },
      };
    } catch (error: unknown) {
      if (
        error instanceof ConflictException ||
        error instanceof ValidationException ||
        error instanceof AppException
      ) {
        throw error;
      }
      throw new AppException(500, 'Failed to create user account');
    }
  }

  async signin(signinDto: SigninDto) {
    try {
      const { email, password } = signinDto;

      // Find user
      const user = await this.userModel
        .findOne({ email: email.toLowerCase() })
        .select('_id email password name profilePath currency isVerified createdAt');
      if (!user) {
        throw new AuthenticationException('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationException('Invalid email or password');
      }

      // Generate JWT tokens
      const token = this.generateToken(user._id.toString(), user.email);
      const refreshToken = this.generateRefreshToken(
        user._id.toString(),
        user.email,
      );

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

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
          refreshToken,
        },
      };
    } catch (error: unknown) {
      if (
        error instanceof AuthenticationException ||
        error instanceof AppException
      ) {
        throw error;
      }
      throw new AppException(500, 'Failed to sign in');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;

      // Find user
      const user = await this.userModel
        .findOne({ email: email.toLowerCase() })
        .select('_id email name')
        .lean();
      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message:
            'If an account exists with this email, a password reset link has been sent.',
        };
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        this.getJwtSecret(),
        { expiresIn: '1h' },
      );

      // Store reset token in database
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1);

      await this.tokenModel.create({
        token: resetToken,
        type: 'password-reset',
        userId: user._id,
        used: false,
        expiresAt: tokenExpiresAt,
      });

      const resetLink = `${this.appConfig.clientUrl}/auth/reset-password?token=${resetToken}`;

      // Send reset password email
      try {
        const clientUrl = this.appConfig.clientUrl;
        await this.emailService.sendTemplatedEmail('reset-password', user.email, [
          { key: 'name', value: user.name },
          { key: 'resetLink', value: resetLink },
          {
            key: 'supportEmail',
            value: this.emailConfig.supportEmail,
          },
          { key: 'facebookLink', value: this.emailConfig.facebookLink },
          { key: 'twitterLink', value: this.emailConfig.twitterLink },
          { key: 'instagramLink', value: this.emailConfig.instagramLink },
          {
            key: 'companyAddress',
            value: this.emailConfig.companyAddress,
          },
          { key: 'privacyPolicyLink', value: `${clientUrl}/privacy-policy` },
          { key: 'termsLink', value: `${clientUrl}/terms-of-service` },
          { key: 'unsubscribeLink', value: `${clientUrl}/unsubscribe` },
        ]);
      } catch (emailError: unknown) {
        logError('Error sending reset password email', emailError);
        throw new AppException(500, 'Failed to send reset password email');
      }

      return {
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(500, 'Failed to process password reset request');
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    try {
      const { password } = resetPasswordDto;

      // Verify token
      let decoded: { userId: string; email: string };
      try {
        decoded = jwt.verify(token, this.getJwtSecret()) as {
          userId: string;
          email: string;
        };
      } catch (error: unknown) {
        throw new AuthenticationException('Invalid or expired reset token');
      }

      // Check if token has been used
      const tokenRecord = await this.tokenModel.findOne({
        token,
        type: 'password-reset',
        used: false,
      });

      if (!tokenRecord) {
        throw new AuthenticationException('Invalid or already used reset token');
      }

      // Check if token is expired
      if (tokenRecord.expiresAt < new Date()) {
        throw new AuthenticationException('Reset token has expired');
      }

      // Find user with password history
      const user = await this.userModel
        .findOne({ email: decoded.email })
        .select('password passwordHistory')
        .exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check password history (prevent reusing last 5 passwords)
      const passwordHistorySize = 5;
      if (user.passwordHistory && user.passwordHistory.length > 0) {
        for (const oldPasswordEntry of user.passwordHistory.slice(
          -passwordHistorySize,
        )) {
          const isSamePassword = await bcrypt.compare(
            password,
            oldPasswordEntry.password,
          );
          if (isSamePassword) {
            throw new ValidationException(
              'You cannot reuse a recently used password. Please choose a different password.',
            );
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

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error: unknown) {
      if (
        error instanceof AuthenticationException ||
        error instanceof NotFoundException ||
        error instanceof ValidationException ||
        error instanceof AppException
      ) {
        throw error;
      }
      throw new AppException(500, 'Failed to reset password');
    }
  }

  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    try {
      const { token } = verifyAccountDto;

      // Verify token
      let decoded: { userId: string; email: string };
      try {
        decoded = jwt.verify(token, this.getJwtSecret()) as {
          userId: string;
          email: string;
        };
      } catch (error: unknown) {
        throw new AuthenticationException(
          'Invalid or expired verification token',
        );
      }

      // Check if token has been used
      const tokenRecord = await this.tokenModel.findOne({
        token,
        type: 'email-verification',
        used: false,
      });

      if (!tokenRecord) {
        throw new AuthenticationException(
          'Invalid or already used verification token',
        );
      }

      // Check if token is expired
      if (tokenRecord.expiresAt < new Date()) {
        throw new AuthenticationException('Verification token has expired');
      }

      // Find user
      const user = await this.userModel
        .findOne({ email: decoded.email })
        .select('_id email name profilePath currency isVerified createdAt')
        .lean();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if already verified
      if (user.isVerified) {
        return {
          success: true,
          message: 'Account is already verified',
        };
      }

      // Update verification status
      await this.userModel.updateOne(
        { _id: user._id },
        { $set: { isVerified: true } },
      );

      // Mark token as used
      tokenRecord.used = true;
      tokenRecord.usedAt = new Date();
      await tokenRecord.save();

      return {
        success: true,
        message: 'Account verified successfully',
      };
    } catch (error: unknown) {
      if (
        error instanceof AuthenticationException ||
        error instanceof NotFoundException ||
        error instanceof AppException
      ) {
        throw error;
      }
      throw new AppException(500, 'Failed to verify account');
    }
  }

  async verifyToken(userId: string, email: string) {
    try {
      const user = await this.userModel
        .findOne({ email })
        .select('_id email name profilePath currency isVerified createdAt')
        .lean();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        message: 'Token is valid',
        data: {
          user,
        },
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof AppException) {
        throw error;
      }
      throw new AppException(500, 'Failed to verify token');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;

      // Verify refresh token
      let decoded: { userId: string; email: string };
      try {
        decoded = jwt.verify(refreshToken, this.getJwtRefreshSecret()) as {
          userId: string;
          email: string;
        };
      } catch (error: unknown) {
        throw new AuthenticationException('Invalid or expired refresh token');
      }

      // Generate new access token
      const newToken = this.generateToken(decoded.userId, decoded.email);
      const newRefreshToken = this.generateRefreshToken(
        decoded.userId,
        decoded.email,
      );

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error: unknown) {
      if (
        error instanceof AuthenticationException ||
        error instanceof AppException
      ) {
        throw error;
      }
      throw new AppException(500, 'Failed to refresh token');
    }
  }
}

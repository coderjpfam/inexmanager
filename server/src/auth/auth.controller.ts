import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { throttleConfig } from '../config/throttle.config';
import { ApiResponseDto, ApiErrorResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.signup })
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.signin })
  @HttpCode(HttpStatus.OK)
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if account exists)',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.forgotPassword })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiQuery({ name: 'token', description: 'Password reset token from email', required: true })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired token', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.resetPassword })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @Get('reset-password')
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiQuery({ name: 'token', description: 'Password reset token from email', required: true })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Token is required', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.resetPassword })
  @HttpCode(HttpStatus.OK)
  async resetPasswordGet(@Query('token') token: string) {
    // For GET requests, we just validate the token exists
    // The actual password reset should be done via POST
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Token is required');
    }
    return {
      success: true,
      message: 'Token is valid. Please use POST method to reset password.',
    };
  }

  @Get('verify-account')
  @ApiOperation({ summary: 'Verify user account email' })
  @ApiQuery({ name: 'token', description: 'Verification token from email', required: true })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired token', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.verifyAccount })
  @HttpCode(HttpStatus.OK)
  async verifyAccount(@Query() verifyAccountDto: VerifyAccountDto) {
    return this.authService.verifyAccount(verifyAccountDto);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token', type: ApiErrorResponseDto })
  @Throttle({ default: throttleConfig.refreshToken })
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('verify-token')
  @ApiOperation({ summary: 'Verify access token validity' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token', type: ApiErrorResponseDto })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@CurrentUser() user: { userId: string; email: string }) {
    return this.authService.verifyToken(user.userId, user.email);
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class PasswordValidationService {
  private minLength: number;
  private requireLowercase: boolean;
  private requireUppercase: boolean;
  private requireNumber: boolean;
  private requireSpecialChar: boolean;
  private specialChars: string;

  constructor(private configService: ConfigService) {
    // Load from config or use defaults
    this.minLength =
      parseInt(this.configService.get<string>('PASSWORD_MIN_LENGTH') || '8', 10) || 8;
    this.requireLowercase =
      this.configService.get<string>('PASSWORD_REQUIRE_LOWERCASE') !== 'false';
    this.requireUppercase =
      this.configService.get<string>('PASSWORD_REQUIRE_UPPERCASE') !== 'false';
    this.requireNumber =
      this.configService.get<string>('PASSWORD_REQUIRE_NUMBER') !== 'false';
    this.requireSpecialChar =
      this.configService.get<string>('PASSWORD_REQUIRE_SPECIAL') !== 'false';
    this.specialChars =
      this.configService.get<string>('PASSWORD_SPECIAL_CHARS') || '@$!%*?&';
  }

  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password || password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters long`);
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.requireNumber && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.requireSpecialChar) {
      const specialCharRegex = new RegExp(`[${this.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
      if (!specialCharRegex.test(password)) {
        errors.push(
          `Password must contain at least one special character (${this.specialChars})`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

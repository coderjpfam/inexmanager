/**
 * Client-Side Validation Utilities
 * Provides validation functions for form inputs
 */

/**
 * Email validation regex
 * Matches standard email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and requirements met
 */
export interface PasswordValidation {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (metCount >= 4 && requirements.minLength) {
    strength = 'strong';
  } else if (metCount >= 3) {
    strength = 'medium';
  }

  const isValid = Object.values(requirements).every(Boolean);

  return {
    isValid,
    requirements,
    strength,
  };
};

/**
 * Validate name format
 * @param name - Name to validate
 * @returns true if valid, false otherwise
 */
export const isValidName = (name: string): boolean => {
  if (!name || name.trim() === '') {
    return false;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return false;
  }
  // Allow letters, spaces, hyphens, and apostrophes
  return /^[a-zA-Z\s'-]+$/.test(trimmed);
};

/**
 * Validate that passwords match
 * @param password - Password
 * @param confirmPassword - Confirm password
 * @returns true if passwords match, false otherwise
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

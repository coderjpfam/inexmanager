import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Name can only contain letters, spaces, hyphens, and apostrophes',
      ),
    email: z.string().trim().email('Please provide a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[@$!%*?&]/,
        'Password must contain at least one special character (@$!%*?&)',
      ),
    confirmPassword: z.string(),
    profileImage: z.string().url('Profile image must be a valid URL').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export class SignupDto extends createZodDto(signupSchema) {}

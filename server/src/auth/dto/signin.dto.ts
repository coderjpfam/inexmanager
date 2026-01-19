import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export class SigninDto extends createZodDto(signinSchema) {}

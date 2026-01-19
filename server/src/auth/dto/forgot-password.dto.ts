import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address').toLowerCase(),
});

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}

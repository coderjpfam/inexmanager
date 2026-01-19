import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const verifyAccountSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export class VerifyAccountDto extends createZodDto(verifyAccountSchema) {}

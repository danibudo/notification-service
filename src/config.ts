import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  RABBITMQ_URL: z.string().url().default('amqp://guest:guest@localhost:5672'),
  RABBITMQ_PREFETCH: z.coerce.number().default(10),
  USER_SERVICE_URL: z.string().url().default('http://localhost:8080'),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().default('noreply@library.local'),
  FRONTEND_BASE_URL: z.string().url().default('http://localhost:4200'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = result.data;

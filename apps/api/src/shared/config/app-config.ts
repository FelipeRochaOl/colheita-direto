import { z } from 'zod';

/** Valor vazio ou em branco (ex.: segredo ainda não preenchido no Secrets Manager) = integração desligada. */
const optionalText = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined));

export const appConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  WEB_APP_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16),
  PRIVACY_POLICY_VERSION: z.string().default('2026-11'),

  MONGODB_URI: z.string(),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ENDPOINT_URL: optionalText,
  HARVEST_PHOTOS_BUCKET: z.string(),
  HARVEST_LOT_EVENTS_QUEUE_URL: z.string(),
  NOTIFICATION_EVENTS_QUEUE_URL: z.string(),

  VISION_SERVICE_URL: z.string(),

  BEDROCK_REGION: z.string().default('us-east-1'),
  CLAUDE_MODEL_ID: z.string().default('anthropic.claude-opus-5-5'),

  ASAAS_API_URL: z.string().default('https://api-sandbox.asaas.com/v3'),
  ASAAS_API_KEY: optionalText,
  ASAAS_WEBHOOK_TOKEN: optionalText,
  ASAAS_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(30).default(8),

  WHATSAPP_GRAPH_API_URL: z.string().default('https://graph.facebook.com/v23.0'),
  WHATSAPP_PHONE_NUMBER_ID: optionalText,
  WHATSAPP_ACCESS_TOKEN: optionalText,
  WHATSAPP_APP_SECRET: optionalText,
  WHATSAPP_VERIFY_TOKEN: optionalText,

  SMS_ENABLED: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export function validateAppConfig(rawEnvironment: Record<string, unknown>): AppConfig {
  return appConfigSchema.parse(rawEnvironment);
}

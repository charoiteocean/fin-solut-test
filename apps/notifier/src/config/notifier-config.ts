import * as Joi from 'joi';

export interface NotifierConfig {
  port: number;
  rabbitmqUrl: string;
  databaseUrl: string;
  databaseSchema: string;
  telegramBotToken: string;
  telegramApiBaseUrl: string;
  retryTtlMs: number;
  maxRetries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const notifierConfigSchema = Joi.object<NotifierConfig>({
  port: Joi.number().port().default(3002),
  rabbitmqUrl: Joi.string().uri({ scheme: ['amqp', 'amqps'] }).required(),
  databaseUrl: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  databaseSchema: Joi.string().default('notifier'),
  telegramBotToken: Joi.string().required(),
  telegramApiBaseUrl: Joi.string().uri().default('https://api.telegram.org'),
  retryTtlMs: Joi.number().integer().min(1000).default(10000),
  maxRetries: Joi.number().integer().min(1).default(3),
  logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
});

export const loadNotifierConfig = (env: NodeJS.ProcessEnv): NotifierConfig => {
  const raw: NotifierConfig = {
    port: Number(env.NOTIFIER_PORT ?? 3002),
    rabbitmqUrl: env.RABBITMQ_URL ?? '',
    databaseUrl: env.DATABASE_URL ?? '',
    databaseSchema: env.DATABASE_SCHEMA ?? 'notifier',
    telegramBotToken: env.TELEGRAM_BOT_TOKEN ?? '',
    telegramApiBaseUrl: env.TELEGRAM_API_BASE_URL ?? 'https://api.telegram.org',
    retryTtlMs: Number(env.NOTIFIER_RETRY_TTL_MS ?? 10000),
    maxRetries: Number(env.NOTIFIER_MAX_RETRIES ?? 3),
    logLevel: (env.LOG_LEVEL as NotifierConfig['logLevel']) ?? 'info',
  };
  const { value, error } = notifierConfigSchema.validate(raw, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid notifier config: ${error.message}`);
  }
  if (!value) {
    throw new Error('Invalid notifier config: validation returned no value');
  }
  return value;
};

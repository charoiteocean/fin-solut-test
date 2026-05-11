import * as Joi from 'joi';

export interface ConsumerConfig {
  port: number;
  rabbitmqUrl: string;
  databaseUrl: string;
  databaseSchema: string;
  retryTtlMs: number;
  maxRetries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const consumerConfigSchema = Joi.object<ConsumerConfig>({
  port: Joi.number().port().default(3001),
  rabbitmqUrl: Joi.string().uri({ scheme: ['amqp', 'amqps'] }).required(),
  databaseUrl: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  databaseSchema: Joi.string().default('consumer'),
  retryTtlMs: Joi.number().integer().min(1000).default(10000),
  maxRetries: Joi.number().integer().min(1).default(3),
  logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
});

export const loadConsumerConfig = (env: NodeJS.ProcessEnv): ConsumerConfig => {
  const raw: ConsumerConfig = {
    port: Number(env.CONSUMER_PORT ?? 3001),
    rabbitmqUrl: env.RABBITMQ_URL ?? '',
    databaseUrl: env.DATABASE_URL ?? '',
    databaseSchema: env.DATABASE_SCHEMA ?? 'consumer',
    retryTtlMs: Number(env.CONSUMER_RETRY_TTL_MS ?? 10000),
    maxRetries: Number(env.CONSUMER_MAX_RETRIES ?? 3),
    logLevel: (env.LOG_LEVEL as ConsumerConfig['logLevel']) ?? 'info',
  };
  const { value, error } = consumerConfigSchema.validate(raw, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid consumer config: ${error.message}`);
  }
  if (!value) {
    throw new Error('Invalid consumer config: validation returned no value');
  }
  return value;
};

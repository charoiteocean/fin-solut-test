import * as Joi from 'joi';

export interface ProducerConfig {
  port: number;
  rabbitmqUrl: string;
  retryTtlMs: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const producerConfigSchema = Joi.object<ProducerConfig>({
  port: Joi.number().port().default(3000),
  rabbitmqUrl: Joi.string().uri({ scheme: ['amqp', 'amqps'] }).required(),
  retryTtlMs: Joi.number().integer().min(1000).default(10000),
  logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
});

export const loadProducerConfig = (env: NodeJS.ProcessEnv): ProducerConfig => {
  const raw: ProducerConfig = {
    port: Number(env.PRODUCER_PORT ?? 3000),
    rabbitmqUrl: env.RABBITMQ_URL ?? '',
    retryTtlMs: Number(env.CONSUMER_RETRY_TTL_MS ?? 10000),
    logLevel: (env.LOG_LEVEL as ProducerConfig['logLevel']) ?? 'info',
  };
  const { value, error } = producerConfigSchema.validate(raw, { abortEarly: false });
  if (error) {
    throw new Error(`Invalid producer config: ${error.message}`);
  }
  if (!value) {
    throw new Error('Invalid producer config: validation returned no value');
  }
  return value;
};

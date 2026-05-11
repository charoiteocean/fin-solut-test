import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { ConsumerModule } from './consumer.module';
import { CONSUMER_CONFIG } from './config/config.module';
import type { ConsumerConfig } from './config/consumer-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ConsumerModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  app.enableShutdownHooks();

  const cfg = app.get<ConsumerConfig>(CONSUMER_CONFIG);
  await app.listen(cfg.port);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('consumer bootstrap failed', err);
  process.exit(1);
});

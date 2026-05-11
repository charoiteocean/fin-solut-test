import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { NotifierModule } from './notifier.module';
import { NOTIFIER_CONFIG } from './config/config.module';
import type { NotifierConfig } from './config/notifier-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(NotifierModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  app.enableShutdownHooks();

  const cfg = app.get<NotifierConfig>(NOTIFIER_CONFIG);
  await app.listen(cfg.port);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('notifier bootstrap failed', err);
  process.exit(1);
});

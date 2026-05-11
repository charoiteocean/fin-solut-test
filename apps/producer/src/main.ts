import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';

import { ProducerModule } from './producer.module';
import { PRODUCER_CONFIG } from './config/config.module';
import type { ProducerConfig } from './config/producer-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ProducerModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Producer Service')
    .setDescription('Accepts HTTP notification requests and publishes them to RabbitMQ')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableShutdownHooks();

  const cfg = app.get<ProducerConfig>(PRODUCER_CONFIG);
  await app.listen(cfg.port);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('producer bootstrap failed', err);
  process.exit(1);
});

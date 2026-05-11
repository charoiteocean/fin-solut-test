import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RabbitMqModule, buildNotificationsTopology } from '@app/rabbitmq';

import { ConfigModule, NOTIFIER_CONFIG } from './config/config.module';
import { NotificationsConsumerModule } from './consumer/consumer.module';
import { ProcessedEvent } from './idempotency/entities/processed-event.entity';
import { CreateProcessedEvents1714000000000 } from '../migrations/1714000000000-CreateProcessedEvents';
import type { NotifierConfig } from './config/notifier-config';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [NOTIFIER_CONFIG],
      useFactory: (cfg: NotifierConfig) => ({
        pinoHttp: {
          level: cfg.logLevel,
          transport:
            process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
          customProps: () => ({ service: 'notifier' }),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [NOTIFIER_CONFIG],
      useFactory: (cfg: NotifierConfig) => ({
        type: 'postgres' as const,
        url: cfg.databaseUrl,
        schema: cfg.databaseSchema,
        entities: [ProcessedEvent],
        migrations: [CreateProcessedEvents1714000000000],
        migrationsRun: true,
        migrationsTableName: 'migrations_history',
      }),
    }),
    RabbitMqModule.forRootAsync({
      inject: [NOTIFIER_CONFIG],
      useFactory: (cfg: NotifierConfig) => ({
        url: cfg.rabbitmqUrl,
        serviceName: 'notifier',
        topology: buildNotificationsTopology({ retryTtlMs: cfg.retryTtlMs }),
      }),
    }),
    NotificationsConsumerModule,
  ],
})
export class NotifierModule {}

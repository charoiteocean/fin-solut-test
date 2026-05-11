import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RabbitMqModule, buildNotificationsTopology } from '@app/rabbitmq';

import { ConfigModule, CONSUMER_CONFIG } from './config/config.module';
import { NotificationsConsumerModule } from './consumer/consumer.module';
import { ProcessedEvent } from './idempotency/entities/processed-event.entity';
import { CreateProcessedEvents1714000000000 } from '../migrations/1714000000000-CreateProcessedEvents';
import type { ConsumerConfig } from './config/consumer-config';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [CONSUMER_CONFIG],
      useFactory: (cfg: ConsumerConfig) => ({
        pinoHttp: {
          level: cfg.logLevel,
          transport:
            process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
          customProps: () => ({ service: 'consumer' }),
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [CONSUMER_CONFIG],
      useFactory: (cfg: ConsumerConfig) => ({
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
      inject: [CONSUMER_CONFIG],
      useFactory: (cfg: ConsumerConfig) => ({
        url: cfg.rabbitmqUrl,
        serviceName: 'consumer',
        topology: buildNotificationsTopology({ retryTtlMs: cfg.retryTtlMs }),
      }),
    }),
    NotificationsConsumerModule,
  ],
})
export class ConsumerModule {}

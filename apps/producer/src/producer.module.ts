import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { RabbitMqModule, buildNotificationsTopology } from '@app/rabbitmq';

import { ConfigModule, PRODUCER_CONFIG } from './config/config.module';
import { NotificationsModule } from './notifications/notifications.module';
import type { ProducerConfig } from './config/producer-config';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [PRODUCER_CONFIG],
      useFactory: (cfg: ProducerConfig) => ({
        pinoHttp: {
          level: cfg.logLevel,
          transport:
            process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
          customProps: () => ({ service: 'producer' }),
        },
      }),
    }),
    RabbitMqModule.forRootAsync({
      inject: [PRODUCER_CONFIG],
      useFactory: (cfg: ProducerConfig) => ({
        url: cfg.rabbitmqUrl,
        serviceName: 'producer',
        topology: buildNotificationsTopology({ retryTtlMs: cfg.retryTtlMs }),
      }),
    }),
    NotificationsModule,
  ],
})
export class ProducerModule {}

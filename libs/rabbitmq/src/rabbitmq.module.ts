import { DynamicModule, Module } from '@nestjs/common';

import { RABBITMQ_CONNECTION } from './connection/rabbitmq.tokens';
import {
  RabbitMqConnection,
  type RabbitMqConnectionConfig,
} from './connection/rabbitmq-connection';

export interface RabbitMqModuleOptions {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<RabbitMqConnectionConfig> | RabbitMqConnectionConfig;
}

@Module({})
export class RabbitMqModule {
  static forRootAsync(opts: RabbitMqModuleOptions): DynamicModule {
    return {
      module: RabbitMqModule,
      global: true,
      providers: [
        {
          provide: RABBITMQ_CONNECTION,
          inject: opts.inject ?? [],
          useFactory: async (...args: any[]): Promise<RabbitMqConnection> => {
            const config = await opts.useFactory(...args);
            const conn = new RabbitMqConnection(config);
            await conn.connect();
            return conn;
          },
        },
      ],
      exports: [RABBITMQ_CONNECTION],
    };
  }
}

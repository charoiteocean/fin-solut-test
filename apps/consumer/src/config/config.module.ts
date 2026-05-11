import { Global, Module } from '@nestjs/common';
import { loadConsumerConfig, type ConsumerConfig } from './consumer-config';

export const CONSUMER_CONFIG = Symbol('CONSUMER_CONFIG');

@Global()
@Module({
  providers: [
    {
      provide: CONSUMER_CONFIG,
      useFactory: (): ConsumerConfig => loadConsumerConfig(process.env),
    },
  ],
  exports: [CONSUMER_CONFIG],
})
export class ConfigModule {}

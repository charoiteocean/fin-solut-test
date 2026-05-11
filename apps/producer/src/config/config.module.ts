import { Global, Module } from '@nestjs/common';
import { loadProducerConfig, type ProducerConfig } from './producer-config';

export const PRODUCER_CONFIG = Symbol('PRODUCER_CONFIG');

@Global()
@Module({
  providers: [
    {
      provide: PRODUCER_CONFIG,
      useFactory: (): ProducerConfig => loadProducerConfig(process.env),
    },
  ],
  exports: [PRODUCER_CONFIG],
})
export class ConfigModule {}

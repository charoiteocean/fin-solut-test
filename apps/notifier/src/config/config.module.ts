import { Global, Module } from '@nestjs/common';
import { loadNotifierConfig, type NotifierConfig } from './notifier-config';

export const NOTIFIER_CONFIG = Symbol('NOTIFIER_CONFIG');

@Global()
@Module({
  providers: [
    {
      provide: NOTIFIER_CONFIG,
      useFactory: (): NotifierConfig => loadNotifierConfig(process.env),
    },
  ],
  exports: [NOTIFIER_CONFIG],
})
export class ConfigModule {}

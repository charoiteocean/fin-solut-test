import { Module } from '@nestjs/common';

import { ConfigModule, NOTIFIER_CONFIG } from '../config/config.module';
import type { NotifierConfig } from '../config/notifier-config';
import { TelegramApi } from './telegram.api';
import { TelegramService } from './telegram.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TelegramApi,
      inject: [NOTIFIER_CONFIG],
      useFactory: (cfg: NotifierConfig): TelegramApi =>
        new TelegramApi({ botToken: cfg.telegramBotToken, apiRoot: cfg.telegramApiBaseUrl }),
    },
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}

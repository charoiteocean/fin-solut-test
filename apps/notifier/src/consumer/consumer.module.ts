import { Module } from '@nestjs/common';

import { IdempotencyModule } from '../idempotency/idempotency.module';
import { TelegramModule } from '../telegram/telegram.module';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsSubscriber } from './notifications.subscriber';

@Module({
  imports: [IdempotencyModule, TelegramModule],
  providers: [NotificationsConsumer, NotificationsSubscriber],
})
export class NotificationsConsumerModule {}

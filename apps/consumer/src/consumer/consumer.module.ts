import { Module } from '@nestjs/common';

import { IdempotencyModule } from '../idempotency/idempotency.module';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsSubscriber } from './notifications.subscriber';
import { NotificationsPublisher } from '../publishers/notifications.publisher';

@Module({
  imports: [IdempotencyModule],
  providers: [NotificationsConsumer, NotificationsSubscriber, NotificationsPublisher],
})
export class NotificationsConsumerModule {}

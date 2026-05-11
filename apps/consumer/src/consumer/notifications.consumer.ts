import { Injectable, Logger } from '@nestjs/common';
import type { NotificationCreatedEvent } from '@app/contracts';

import { IdempotencyService } from '../idempotency/idempotency.service';
import { NotificationsPublisher } from '../publishers/notifications.publisher';

@Injectable()
export class NotificationsConsumer {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(
    private readonly idempotency: IdempotencyService,
    private readonly publisher: NotificationsPublisher,
  ) {}

  async handle(event: NotificationCreatedEvent): Promise<void> {
    if (await this.idempotency.isProcessed(event.eventId)) {
      this.logger.debug(`duplicate, skipping eventId=${event.eventId}`);
      return;
    }

    await this.publisher.publishSend(event);
    await this.idempotency.markProcessed(event.eventId);

    this.logger.log(`event re-published to NOTIFICATIONS_OUT eventId=${event.eventId}`);
  }
}

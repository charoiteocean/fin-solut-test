import { Injectable, Logger } from '@nestjs/common';
import type { NotificationSendEvent } from '@app/contracts';

import { IdempotencyService } from '../idempotency/idempotency.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class NotificationsConsumer {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(
    private readonly idempotency: IdempotencyService,
    private readonly telegram: TelegramService,
  ) {}

  async handle(event: NotificationSendEvent): Promise<void> {
    if (await this.idempotency.isProcessed(event.eventId)) {
      this.logger.debug(`duplicate, skipping eventId=${event.eventId}`);
      return;
    }

    await this.telegram.send(event.payload);
    await this.idempotency.markProcessed(event.eventId);

    this.logger.log(`telegram message sent eventId=${event.eventId}`);
  }
}

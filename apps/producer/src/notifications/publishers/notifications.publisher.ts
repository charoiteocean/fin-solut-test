import { Inject, Injectable } from '@nestjs/common';
import {
  EXCHANGES,
  ROUTING_KEYS,
  type NotificationCreatedEvent,
} from '@app/contracts';
import { RABBITMQ_CONNECTION, type RabbitMqConnection } from '@app/rabbitmq';

export class PublishFailedError extends Error {
  constructor(eventId: string, reason: string) {
    super(`Failed to publish event ${eventId}: ${reason}`);
    this.name = 'PublishFailedError';
  }
}

@Injectable()
export class NotificationsPublisher {
  constructor(
    @Inject(RABBITMQ_CONNECTION) private readonly connection: RabbitMqConnection,
  ) {}

  async publishCreated(event: NotificationCreatedEvent): Promise<void> {
    const channel = this.connection.getChannel();
    const ok = await channel.publish(
      EXCHANGES.NOTIFICATIONS_IN,
      ROUTING_KEYS.NOTIFICATION,
      event,
      {
        persistent: true,
        mandatory: true,
        messageId: event.eventId,
        contentType: 'application/json',
        timestamp: Date.now(),
      },
    );

    if (!ok) {
      throw new PublishFailedError(event.eventId, 'broker returned false');
    }
  }
}

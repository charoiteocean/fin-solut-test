import { Inject, Injectable } from '@nestjs/common';
import {
  EXCHANGES,
  ROUTING_KEYS,
  NOTIFICATION_SEND_EVENT,
  type NotificationCreatedEvent,
  type NotificationSendEvent,
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

  async publishSend(source: NotificationCreatedEvent): Promise<void> {
    const event: NotificationSendEvent = {
      eventId: source.eventId,
      type: NOTIFICATION_SEND_EVENT,
      occurredAt: new Date().toISOString(),
      payload: source.payload,
    };

    const channel = this.connection.getChannel();
    const ok = await channel.publish(
      EXCHANGES.NOTIFICATIONS_OUT,
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

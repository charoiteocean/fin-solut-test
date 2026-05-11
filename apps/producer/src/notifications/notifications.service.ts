import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  NOTIFICATION_CREATED_EVENT,
  type NotificationCreatedEvent,
} from '@app/contracts';

import { NotificationsPublisher } from './publishers/notifications.publisher';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly publisher: NotificationsPublisher) {}

  async create(dto: CreateNotificationDto): Promise<{ eventId: string }> {
    const eventId = randomUUID();
    const event: NotificationCreatedEvent = {
      eventId,
      type: NOTIFICATION_CREATED_EVENT,
      occurredAt: new Date().toISOString(),
      payload: { title: dto.title, message: dto.message, chatId: dto.chatId },
    };
    await this.publisher.publishCreated(event);
    return { eventId };
  }
}

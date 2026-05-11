import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { QUEUES, EXCHANGES, ROUTING_KEYS } from '@app/contracts';
import { RABBITMQ_CONNECTION, type RabbitMqConnection } from '@app/rabbitmq';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';

import { NotificationsConsumer } from './notifications.consumer';
import { NOTIFIER_CONFIG } from '../config/config.module';
import type { NotifierConfig } from '../config/notifier-config';

@Injectable()
export class NotificationsSubscriber implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificationsSubscriber.name);

  constructor(
    @Inject(RABBITMQ_CONNECTION) private readonly connection: RabbitMqConnection,
    @Inject(NOTIFIER_CONFIG) private readonly cfg: NotifierConfig,
    private readonly handler: NotificationsConsumer,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const channel = this.connection.getChannel();
    await channel.addSetup(async (ch: ConfirmChannel) => {
      await ch.prefetch(10);
      await ch.consume(QUEUES.NOTIFIER, (msg) => this.onMessage(ch, msg), { noAck: false });
    });
  }

  private async onMessage(channel: ConfirmChannel, msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    const deathCount = this.getDeathCount(msg);
    if (deathCount > this.cfg.maxRetries) {
      this.logger.error(
        `max retries exceeded, sending to DLQ eventId=${msg.properties.messageId} deathCount=${deathCount}`,
      );
      channel.publish(
        EXCHANGES.NOTIFIER_DLQ,
        ROUTING_KEYS.NOTIFICATION,
        msg.content,
        msg.properties,
      );
      channel.ack(msg);
      return;
    }

    try {
      const event = JSON.parse(msg.content.toString());
      await this.handler.handle(event);
      channel.ack(msg);
    } catch (err) {
      this.logger.warn(
        `handler failed eventId=${msg.properties.messageId} err=${(err as Error).message}`,
      );
      channel.nack(msg, false, false);
    }
  }

  private getDeathCount(msg: ConsumeMessage): number {
    const deaths = msg.properties.headers?.['x-death'] as Array<{ count: number }> | undefined;
    if (!deaths || deaths.length === 0) return 0;
    return deaths.reduce((sum, d) => sum + (d.count ?? 0), 0);
  }
}

import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { ConfirmChannel } from 'amqplib';
import { Logger } from '@nestjs/common';

import { TopologyAsserter } from '../topology/topology-asserter';
import type { RabbitMqTopology } from '../topology/topology.types';

export interface RabbitMqConnectionConfig {
  url: string;
  topology: RabbitMqTopology;
  serviceName: string;
}

export class RabbitMqConnection {
  private readonly logger = new Logger(RabbitMqConnection.name);
  private connection?: amqp.AmqpConnectionManager;
  private channel?: ChannelWrapper;

  constructor(private readonly config: RabbitMqConnectionConfig) {}

  async connect(): Promise<void> {
    this.connection = amqp.connect([this.config.url], {
      heartbeatIntervalInSeconds: 15,
      reconnectTimeInSeconds: 5,
    });

    this.connection.on('connect', () =>
      this.logger.log(`[${this.config.serviceName}] connected to RabbitMQ`),
    );
    this.connection.on('disconnect', ({ err }) =>
      this.logger.warn(`[${this.config.serviceName}] disconnected: ${err?.message}`),
    );

    const asserter = new TopologyAsserter();
    this.channel = this.connection.createChannel({
      json: true,
      confirm: true,
      setup: async (ch: ConfirmChannel) => asserter.assertOn(ch, this.config.topology),
    });

    await this.channel.waitForConnect();
  }

  getChannel(): ChannelWrapper {
    if (!this.channel) {
      throw new Error('RabbitMqConnection: channel is not initialized — call connect() first');
    }
    return this.channel;
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

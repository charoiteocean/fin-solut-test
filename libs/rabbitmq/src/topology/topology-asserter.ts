import type { ConfirmChannel } from 'amqplib';
import type { RabbitMqTopology } from './topology.types';

export class TopologyAsserter {
  async assertOn(channel: ConfirmChannel, topology: RabbitMqTopology): Promise<void> {
    for (const ex of topology.exchanges) {
      await channel.assertExchange(ex.name, ex.type, ex.options ?? { durable: true });
    }
    for (const q of topology.queues) {
      await channel.assertQueue(q.name, q.options ?? { durable: true });
    }
    for (const b of topology.bindings) {
      await channel.bindQueue(b.queue, b.exchange, b.routingKey);
    }
  }
}

import { EXCHANGES, QUEUES, ROUTING_KEYS } from '@app/contracts';
import type { RabbitMqTopology } from './topology.types';

export interface NotificationsTopologyOptions {
  retryTtlMs: number;
}

export const buildNotificationsTopology = (
  options: NotificationsTopologyOptions,
): RabbitMqTopology => ({
  exchanges: [
    { name: EXCHANGES.NOTIFICATIONS_IN, type: 'direct', options: { durable: true } },
    { name: EXCHANGES.NOTIFICATIONS_OUT, type: 'direct', options: { durable: true } },
    { name: EXCHANGES.CONSUMER_RETRY, type: 'direct', options: { durable: true } },
    { name: EXCHANGES.CONSUMER_DLQ, type: 'direct', options: { durable: true } },
    { name: EXCHANGES.NOTIFIER_RETRY, type: 'direct', options: { durable: true } },
    { name: EXCHANGES.NOTIFIER_DLQ, type: 'direct', options: { durable: true } },
  ],
  queues: [
    {
      name: QUEUES.CONSUMER,
      options: {
        durable: true,
        arguments: { 'x-dead-letter-exchange': EXCHANGES.CONSUMER_RETRY },
      },
    },
    {
      name: QUEUES.CONSUMER_RETRY,
      options: {
        durable: true,
        arguments: {
          'x-message-ttl': options.retryTtlMs,
          'x-dead-letter-exchange': EXCHANGES.NOTIFICATIONS_IN,
        },
      },
    },
    { name: QUEUES.CONSUMER_DLQ, options: { durable: true } },
    {
      name: QUEUES.NOTIFIER,
      options: {
        durable: true,
        arguments: { 'x-dead-letter-exchange': EXCHANGES.NOTIFIER_RETRY },
      },
    },
    {
      name: QUEUES.NOTIFIER_RETRY,
      options: {
        durable: true,
        arguments: {
          'x-message-ttl': options.retryTtlMs,
          'x-dead-letter-exchange': EXCHANGES.NOTIFICATIONS_OUT,
        },
      },
    },
    { name: QUEUES.NOTIFIER_DLQ, options: { durable: true } },
  ],
  bindings: [
    { exchange: EXCHANGES.NOTIFICATIONS_IN, queue: QUEUES.CONSUMER, routingKey: ROUTING_KEYS.NOTIFICATION },
    { exchange: EXCHANGES.CONSUMER_RETRY, queue: QUEUES.CONSUMER_RETRY, routingKey: ROUTING_KEYS.NOTIFICATION },
    { exchange: EXCHANGES.CONSUMER_DLQ, queue: QUEUES.CONSUMER_DLQ, routingKey: ROUTING_KEYS.NOTIFICATION },
    { exchange: EXCHANGES.NOTIFICATIONS_OUT, queue: QUEUES.NOTIFIER, routingKey: ROUTING_KEYS.NOTIFICATION },
    { exchange: EXCHANGES.NOTIFIER_RETRY, queue: QUEUES.NOTIFIER_RETRY, routingKey: ROUTING_KEYS.NOTIFICATION },
    { exchange: EXCHANGES.NOTIFIER_DLQ, queue: QUEUES.NOTIFIER_DLQ, routingKey: ROUTING_KEYS.NOTIFICATION },
  ],
});

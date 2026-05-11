export const EXCHANGES = {
  NOTIFICATIONS_IN: 'ex.notifications.in',
  NOTIFICATIONS_OUT: 'ex.notifications.out',
  CONSUMER_RETRY: 'ex.consumer.retry',
  CONSUMER_DLQ: 'ex.consumer.dlq',
  NOTIFIER_RETRY: 'ex.notifier.retry',
  NOTIFIER_DLQ: 'ex.notifier.dlq',
} as const;

export const QUEUES = {
  CONSUMER: 'q.consumer',
  CONSUMER_RETRY: 'q.consumer.retry',
  CONSUMER_DLQ: 'q.consumer.dlq',
  NOTIFIER: 'q.notifier',
  NOTIFIER_RETRY: 'q.notifier.retry',
  NOTIFIER_DLQ: 'q.notifier.dlq',
} as const;

export const ROUTING_KEYS = {
  NOTIFICATION: 'notification',
} as const;

export type ExchangeName = (typeof EXCHANGES)[keyof typeof EXCHANGES];
export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

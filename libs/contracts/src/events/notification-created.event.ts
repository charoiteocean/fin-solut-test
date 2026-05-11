export const NOTIFICATION_CREATED_EVENT = 'notification.created' as const;

export interface NotificationCreatedEvent {
  eventId: string;
  type: typeof NOTIFICATION_CREATED_EVENT;
  occurredAt: string;
  payload: {
    title: string;
    message: string;
    chatId: string;
  };
}

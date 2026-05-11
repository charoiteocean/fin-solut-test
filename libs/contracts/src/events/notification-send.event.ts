export const NOTIFICATION_SEND_EVENT = 'notification.send' as const;

export interface NotificationSendEvent {
  eventId: string;
  type: typeof NOTIFICATION_SEND_EVENT;
  occurredAt: string;
  payload: {
    title: string;
    message: string;
    chatId: string;
  };
}

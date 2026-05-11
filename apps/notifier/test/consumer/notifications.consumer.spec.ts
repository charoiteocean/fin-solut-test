import { NOTIFICATION_SEND_EVENT, type NotificationSendEvent } from '@app/contracts';
import { NotificationsConsumer } from '../../src/consumer/notifications.consumer';

const buildEvent = (id: string): NotificationSendEvent => ({
  eventId: id,
  type: NOTIFICATION_SEND_EVENT,
  occurredAt: '2026-05-07T10:00:00.000Z',
  payload: { title: 't', message: 'm', chatId: '1' },
});

describe('NotificationsConsumer (notifier)', () => {
  let idempotency: { isProcessed: jest.Mock; markProcessed: jest.Mock };
  let telegram: { send: jest.Mock };
  let consumer: NotificationsConsumer;

  beforeEach(() => {
    idempotency = {
      isProcessed: jest.fn().mockResolvedValue(false),
      markProcessed: jest.fn().mockResolvedValue(undefined),
    };
    telegram = { send: jest.fn().mockResolvedValue(undefined) };
    consumer = new NotificationsConsumer(idempotency as any, telegram as any);
  });

  it('sends to Telegram and marks processed', async () => {
    await consumer.handle(buildEvent('id-1'));
    expect(telegram.send).toHaveBeenCalledWith({ chatId: '1', title: 't', message: 'm' });
    expect(idempotency.markProcessed).toHaveBeenCalledWith('id-1');
  });

  it('skips when already processed', async () => {
    idempotency.isProcessed.mockResolvedValue(true);
    await consumer.handle(buildEvent('id-2'));
    expect(telegram.send).not.toHaveBeenCalled();
  });

  it('does not mark processed when telegram fails (so retry can resend)', async () => {
    telegram.send.mockRejectedValue(new Error('429'));
    await expect(consumer.handle(buildEvent('id-3'))).rejects.toThrow('429');
    expect(idempotency.markProcessed).not.toHaveBeenCalled();
  });
});

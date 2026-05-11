import { NOTIFICATION_CREATED_EVENT, type NotificationCreatedEvent } from '@app/contracts';
import { NotificationsConsumer } from '../../src/consumer/notifications.consumer';

const buildEvent = (id: string): NotificationCreatedEvent => ({
  eventId: id,
  type: NOTIFICATION_CREATED_EVENT,
  occurredAt: '2026-05-07T10:00:00.000Z',
  payload: { title: 't', message: 'm', chatId: '1' },
});

describe('NotificationsConsumer', () => {
  let idempotency: { isProcessed: jest.Mock; markProcessed: jest.Mock };
  let publisher: { publishSend: jest.Mock };
  let consumer: NotificationsConsumer;

  beforeEach(() => {
    idempotency = {
      isProcessed: jest.fn().mockResolvedValue(false),
      markProcessed: jest.fn().mockResolvedValue(undefined),
    };
    publisher = { publishSend: jest.fn().mockResolvedValue(undefined) };
    consumer = new NotificationsConsumer(idempotency as any, publisher as any);
  });

  it('publishes and marks processed for new event', async () => {
    await consumer.handle(buildEvent('id-1'));
    expect(publisher.publishSend).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'id-1' }),
    );
    expect(idempotency.markProcessed).toHaveBeenCalledWith('id-1');
  });

  it('skips publishing for already-processed event', async () => {
    idempotency.isProcessed.mockResolvedValue(true);
    await consumer.handle(buildEvent('id-2'));
    expect(publisher.publishSend).not.toHaveBeenCalled();
    expect(idempotency.markProcessed).not.toHaveBeenCalled();
  });

  it('does not mark processed if publish throws (so retry can re-publish)', async () => {
    publisher.publishSend.mockRejectedValue(new Error('broker down'));
    await expect(consumer.handle(buildEvent('id-3'))).rejects.toThrow('broker down');
    expect(idempotency.markProcessed).not.toHaveBeenCalled();
  });
});

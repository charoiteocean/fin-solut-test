import { NotificationsPublisher } from '../../src/notifications/publishers/notifications.publisher';
import { EXCHANGES, ROUTING_KEYS, NOTIFICATION_CREATED_EVENT } from '@app/contracts';

describe('NotificationsPublisher', () => {
  const buildChannelMock = () => ({
    publish: jest.fn().mockResolvedValue(true),
  });

  const buildConnectionMock = (channel: any) => ({ getChannel: () => channel });

  it('publishes to NOTIFICATIONS_IN with routing key and persistent delivery', async () => {
    const channel = buildChannelMock();
    const publisher = new NotificationsPublisher(buildConnectionMock(channel) as any);
    const event = {
      eventId: 'uuid-1',
      type: NOTIFICATION_CREATED_EVENT,
      occurredAt: '2026-05-07T10:00:00.000Z',
      payload: { title: 't', message: 'm', chatId: '1' },
    } as const;

    await publisher.publishCreated(event);

    expect(channel.publish).toHaveBeenCalledWith(
      EXCHANGES.NOTIFICATIONS_IN,
      ROUTING_KEYS.NOTIFICATION,
      event,
      expect.objectContaining({ persistent: true, mandatory: true, messageId: 'uuid-1' }),
    );
  });

  it('throws when broker returns false (publish failed / not routed)', async () => {
    const channel = buildChannelMock();
    channel.publish.mockResolvedValue(false);
    const publisher = new NotificationsPublisher(buildConnectionMock(channel) as any);
    const event = {
      eventId: 'uuid-2',
      type: NOTIFICATION_CREATED_EVENT,
      occurredAt: '2026-05-07T10:00:00.000Z',
      payload: { title: 't', message: 'm', chatId: '1' },
    } as const;

    await expect(publisher.publishCreated(event)).rejects.toThrow(/publish/i);
  });
});

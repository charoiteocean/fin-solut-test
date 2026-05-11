import { NotificationsService } from '../src/notifications/notifications.service';
import { NOTIFICATION_CREATED_EVENT } from '@app/contracts';

describe('NotificationsService', () => {
  it('generates UUID and current timestamp, then publishes', async () => {
    const publisher = { publishCreated: jest.fn().mockResolvedValue(undefined) };
    const service = new NotificationsService(publisher as any);

    const result = await service.create({ title: 't', message: 'm', chatId: '1' });

    expect(result.eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(publisher.publishCreated).toHaveBeenCalledTimes(1);
    const arg = publisher.publishCreated.mock.calls[0][0];
    expect(arg.eventId).toBe(result.eventId);
    expect(arg.type).toBe(NOTIFICATION_CREATED_EVENT);
    expect(arg.payload).toEqual({ title: 't', message: 'm', chatId: '1' });
    expect(new Date(arg.occurredAt).toString()).not.toBe('Invalid Date');
  });
});

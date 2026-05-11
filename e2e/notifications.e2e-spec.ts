import { setupExpectation, getCallCount, getLastCallBody } from './setup/mockserver';
import { waitForEvent } from './setup/db';
import { publishCreated } from './setup/rabbitmq';

const PRODUCER_URL = 'http://localhost:3010';

describe('notifications pipeline (e2e)', () => {
  beforeEach(async () => {
    await setupExpectation();
  });

  it('happy path: POST -> RMQ -> consumer -> notifier -> mock telegram', async () => {
    const res = await fetch(`${PRODUCER_URL}/notifications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Hello', message: 'World', chatId: '99999' }),
    });

    expect(res.status).toBe(202);
    const { eventId } = (await res.json()) as { eventId: string };
    expect(eventId).toMatch(/^[0-9a-f-]{36}$/);

    await waitForEvent(eventId);

    expect(await getCallCount()).toBe(1);
    const body = await getLastCallBody();
    expect(body).not.toBeNull();
    expect(body?.chat_id).toBe('99999');
    expect(body?.parse_mode).toBe('HTML');
    expect(String(body?.text)).toContain('<b>Hello</b>');
    expect(String(body?.text)).toContain('World');
  });

  it('idempotency: re-publishing same event does not double-send', async () => {
    const res = await fetch(`${PRODUCER_URL}/notifications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Idem', message: 'check', chatId: '88888' }),
    });
    const { eventId } = (await res.json()) as { eventId: string };
    await waitForEvent(eventId);
    expect(await getCallCount()).toBe(1);

    await publishCreated({
      eventId,
      type: 'notification.created',
      occurredAt: new Date().toISOString(),
      payload: { title: 'Idem', message: 'check', chatId: '88888' },
    });

    await new Promise((r) => setTimeout(r, 5000));

    expect(await getCallCount()).toBe(1);
  });
});

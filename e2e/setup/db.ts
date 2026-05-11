import { Client } from 'pg';

export async function eventInNotifier(eventId: string): Promise<boolean> {
  const c = new Client({ connectionString: 'postgres://app:app@localhost:5433/app' });
  await c.connect();
  try {
    const res = await c.query(
      'SELECT 1 FROM notifier.processed_events WHERE event_id = $1 LIMIT 1',
      [eventId],
    );
    return (res.rowCount ?? 0) > 0;
  } finally {
    await c.end();
  }
}

export async function waitForEvent(eventId: string, timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await eventInNotifier(eventId)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${eventId} in notifier.processed_events`);
}

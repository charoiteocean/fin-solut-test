import * as amqp from 'amqplib';

export async function publishCreated(event: Record<string, unknown>): Promise<void> {
  const conn = await amqp.connect('amqp://guest:guest@localhost:5673');
  const ch = await conn.createConfirmChannel();
  await new Promise<void>((resolve, reject) => {
    ch.publish(
      'ex.notifications.in',
      'notification',
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        messageId: event.eventId as string,
        contentType: 'application/json',
      },
      (err) => (err ? reject(err) : resolve()),
    );
  });
  await ch.waitForConfirms();
  await ch.close();
  await conn.close();
}

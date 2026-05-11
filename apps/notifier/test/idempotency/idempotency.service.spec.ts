import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

import { ProcessedEvent } from '../../src/idempotency/entities/processed-event.entity';
import { IdempotencyService } from '../../src/idempotency/idempotency.service';

jest.setTimeout(120_000);

describe('IdempotencyService (notifier)', () => {
  let container: StartedPostgreSqlContainer;
  let ds: DataSource;
  let service: IdempotencyService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    ds = await new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      username: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      schema: 'notifier',
      entities: [ProcessedEvent],
    }).initialize();
    await ds.query(`CREATE SCHEMA IF NOT EXISTS "notifier"`);
    await ds.query(`
      CREATE TABLE IF NOT EXISTS "notifier"."processed_events" (
        "event_id" UUID PRIMARY KEY,
        "processed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    service = new IdempotencyService(ds.getRepository(ProcessedEvent));
  });

  afterAll(async () => {
    if (ds?.isInitialized) {
      await ds.destroy();
    }
    await container?.stop();
  });

  beforeEach(async () => {
    await ds.query('TRUNCATE "notifier"."processed_events"');
  });

  it('isProcessed=false initially, true after markProcessed', async () => {
    const id = '00000000-0000-0000-0000-000000000010';
    expect(await service.isProcessed(id)).toBe(false);
    await service.markProcessed(id);
    expect(await service.isProcessed(id)).toBe(true);
  });

  it('markProcessed is idempotent', async () => {
    const id = '00000000-0000-0000-0000-000000000011';
    await service.markProcessed(id);
    await expect(service.markProcessed(id)).resolves.toBeUndefined();
  });
});

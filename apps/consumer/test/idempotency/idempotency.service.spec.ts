import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

import { ProcessedEvent } from '../../src/idempotency/entities/processed-event.entity';
import { IdempotencyService } from '../../src/idempotency/idempotency.service';

jest.setTimeout(120_000);

describe('IdempotencyService (consumer)', () => {
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
      schema: 'consumer',
      entities: [ProcessedEvent],
      synchronize: false,
    }).initialize();
    await ds.query(`CREATE SCHEMA IF NOT EXISTS "consumer"`);
    await ds.query(`
      CREATE TABLE IF NOT EXISTS "consumer"."processed_events" (
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
    await ds.query('TRUNCATE "consumer"."processed_events"');
  });

  it('isProcessed returns false for unseen eventId', async () => {
    expect(await service.isProcessed('00000000-0000-0000-0000-000000000001')).toBe(false);
  });

  it('markProcessed inserts row and isProcessed becomes true', async () => {
    const id = '00000000-0000-0000-0000-000000000002';
    await service.markProcessed(id);
    expect(await service.isProcessed(id)).toBe(true);
  });

  it('markProcessed is idempotent (no error on duplicate)', async () => {
    const id = '00000000-0000-0000-0000-000000000003';
    await service.markProcessed(id);
    await expect(service.markProcessed(id)).resolves.toBeUndefined();
  });
});

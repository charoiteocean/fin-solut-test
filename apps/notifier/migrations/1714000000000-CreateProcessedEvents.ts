import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcessedEvents1714000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = (queryRunner.connection.options as { schema?: string }).schema ?? 'notifier';
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."processed_events" (
        "event_id" UUID PRIMARY KEY,
        "processed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = (queryRunner.connection.options as { schema?: string }).schema ?? 'notifier';
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."processed_events"`);
  }
}

import { execSync } from 'node:child_process';

export default async function teardown(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[e2e] tearing down docker compose stack...');
  execSync('docker compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
}

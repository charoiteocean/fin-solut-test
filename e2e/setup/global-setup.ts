import { execSync } from 'node:child_process';
import { waitForHttp } from './wait-for';

export default async function setup(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[e2e] starting docker compose stack...');
  execSync('docker compose -f docker-compose.test.yml up -d --build', { stdio: 'inherit' });

  await waitForHttp('http://localhost:3010/api/docs', 120_000);
  await waitForHttp('http://localhost:1080/mockserver/status', 60_000);
}

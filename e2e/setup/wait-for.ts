import * as http from 'node:http';

export const waitForHttp = (url: string, timeoutMs = 90_000): Promise<void> =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = (): void => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      req.on('error', retry);
    };
    const retry = (): void => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`waitForHttp timeout: ${url}`));
        return;
      }
      setTimeout(tick, 1000);
    };
    tick();
  });

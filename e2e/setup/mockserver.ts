const BASE = 'http://localhost:1080';

export async function setupExpectation(): Promise<void> {
  await fetch(`${BASE}/mockserver/reset`, { method: 'PUT' });
  await fetch(`${BASE}/mockserver/expectation`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      httpRequest: {
        method: 'POST',
        path: '/bot.*/sendMessage',
      },
      httpResponse: {
        statusCode: 200,
        headers: { 'content-type': ['application/json'] },
        body: JSON.stringify({ ok: true, result: { message_id: 1 } }),
      },
    }),
  });
}

interface MockServerRequest {
  path: string;
  body?:
    | string
    | {
        type?: string;
        string?: string;
        json?: unknown;
        rawBytes?: string;
      };
}

const fetchRequests = async (): Promise<MockServerRequest[]> => {
  const res = await fetch(
    `${BASE}/mockserver/retrieve?type=REQUESTS&format=JSON`,
    { method: 'PUT' },
  );
  return (await res.json()) as MockServerRequest[];
};

export async function getCallCount(): Promise<number> {
  const requests = await fetchRequests();
  return requests.filter((r) => /\/bot.*\/sendMessage/.test(r.path)).length;
}

export async function getLastCallBody(): Promise<Record<string, unknown> | null> {
  const requests = await fetchRequests();
  const last = [...requests].reverse().find((r) => /\/bot.*\/sendMessage/.test(r.path));
  if (!last?.body) return null;

  let raw: string | null = null;
  let jsonObject: unknown = null;

  if (typeof last.body === 'string') {
    raw = last.body;
  } else {
    const b = last.body;
    if (b.json !== undefined && b.json !== null) {
      if (typeof b.json === 'string') {
        raw = b.json;
      } else {
        jsonObject = b.json;
      }
    } else if (typeof b.string === 'string') {
      raw = b.string;
    } else if (typeof b.rawBytes === 'string') {
      raw = Buffer.from(b.rawBytes, 'base64').toString('utf-8');
    }
  }

  if (jsonObject !== null && typeof jsonObject === 'object') {
    return jsonObject as Record<string, unknown>;
  }
  if (raw === null) {
    // eslint-disable-next-line no-console
    console.warn('[mockserver] unrecognized body shape:', JSON.stringify(last.body).slice(0, 200));
    return null;
  }
  return parseFormOrJson(raw);
}

const parseFormOrJson = (raw: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const params = new URLSearchParams(raw);
    const obj: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      obj[k] = v;
    }
    return Object.keys(obj).length > 0 ? obj : null;
  }
};

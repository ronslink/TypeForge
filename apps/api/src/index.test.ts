import { describe, expect, it } from 'vitest';
import app from './index.js';

describe('health endpoints', () => {
  it.each(['/health', '/api/health'])('returns public health data from %s', async (path) => {
    const response = await app.request(path);
    const body = (await response.json()) as {
      status: string;
      version: string;
      timestamp: string;
    };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: 'healthy',
      version: '0.0.1',
    });
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('allows requests from the production site', async () => {
    const response = await app.request('/api/health', {
      headers: { Origin: 'https://www.typingscholar.com' },
    });

    expect(response.headers.get('access-control-allow-origin')).toBe(
      'https://www.typingscholar.com'
    );
  });
});

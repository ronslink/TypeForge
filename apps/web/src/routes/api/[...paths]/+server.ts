import { type RequestEvent } from '@sveltejs/kit';
import app from '@typeforge/api';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
  runtime: 'nodejs22.x',
  memory: 1024,
  maxDuration: 15,
};

export const fallback = async ({ request }: RequestEvent) => {
  return app.fetch(request);
};

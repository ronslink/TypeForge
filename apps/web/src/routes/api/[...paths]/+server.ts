import { type RequestEvent } from '@sveltejs/kit';
import app from '@typeforge/api';
import type { Config } from '@sveltejs/adapter-vercel';
import { env } from '$env/dynamic/private';
import { installApiErrorReporter } from '$lib/server/api-error-reporting';

// The Hono app converts thrown errors into JSON responses, so Sentry never sees
// them unless the API reports them explicitly. Installing the reporter here
// rather than in hooks.server.ts keeps the Hono app, Stripe and nodemailer out
// of the bundle of every non-API serverless function.
installApiErrorReporter();

export const config: Config = {
  runtime: 'nodejs22.x',
  memory: 1024,
  maxDuration: 15,
};

export const fallback = async ({ request }: RequestEvent) => {
  return app.fetch(request, env);
};

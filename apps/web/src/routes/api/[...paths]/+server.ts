import { type RequestEvent } from '@sveltejs/kit';
import app from '@typeforge/api';

export const fallback = async ({ request }: RequestEvent) => {
  return app.fetch(request);
};

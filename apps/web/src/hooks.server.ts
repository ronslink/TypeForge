import { withClerkHandler } from 'svelte-clerk/server';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export const handle = withClerkHandler({
  publishableKey: publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY || privateEnv.VITE_CLERK_PUBLISHABLE_KEY || privateEnv.CLERK_PUBLISHABLE_KEY,
  secretKey: privateEnv.CLERK_SECRET_KEY,
});

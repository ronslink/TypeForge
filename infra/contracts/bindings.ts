/**
 * TypeForge Cloudflare Worker Bindings
 * Interface matching all wrangler.toml bindings for type-safe env access
 */
type Hyperdrive = any;
type D1Database = any;
type R2Bucket = any;
type Queue = any;
type KVNamespace = any;

export interface Env {
  // Regional PostgreSQL via Hyperdrive
  HYPERDRIVE_EU: Hyperdrive;
  HYPERDRIVE_US: Hyperdrive;
  HYPERDRIVE_AF: Hyperdrive;

  // Edge cache / ORM metadata
  DB: D1Database;

  // Asset storage (images, audio, etc.)
  ASSETS: R2Bucket;

  // Background job queue
  JOBS: Queue;

  // KV cache for sessions and rate limiting
  CACHE: KVNamespace;


  // Clerk authentication
  CLERK_SECRET_KEY: string;

  // Environment
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

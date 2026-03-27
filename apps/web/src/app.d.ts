/// <reference types="@sveltejs/kit" />
/// <reference types="@cloudflare/workers-types" />
/// <reference types="svelte-clerk/env" />

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    interface Locals {
      userId?: string;
      user?: {
        id: string;
        email: string;
        role: 'learner' | 'teacher' | 'org_admin' | 'platform_admin';
        homeRegion: 'EU' | 'US' | 'AF';
      };
    }
    interface PageData {}
    interface PageState {}
    interface Platform {
      env: {
        HYPERDRIVE_EU: Hyperdrive;
        HYPERDRIVE_US: Hyperdrive;
        HYPERDRIVE_AF: Hyperdrive;
        DB: D1Database;
        ASSETS: R2Bucket;
        JOBS: Queue;
        CACHE: KVNamespace;
        UPSTASH_REDIS_REST_URL: string;
        UPSTASH_REDIS_REST_TOKEN: string;
      };
      context: ExecutionContext;
    }
  }
}

export {};

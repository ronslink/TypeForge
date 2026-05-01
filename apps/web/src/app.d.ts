/// <reference types="@sveltejs/kit" />
type Hyperdrive = any;
type D1Database = any;
type R2Bucket = any;
type Queue = any;
type KVNamespace = any;
type ExecutionContext = any;

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
      /** Auth object injected by svelte-clerk's withClerkHandler */
      auth: any;
      /** Browser language detected from Accept-Language header */
      detectedLocale?: string;
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
      };
      context: ExecutionContext;
    }
  }
}

export {};

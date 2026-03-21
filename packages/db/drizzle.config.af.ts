import { defineConfig } from 'drizzle-kit';

// Africa region configuration
export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle/af',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_AF ?? 'postgresql://localhost:5432/typeforge_af',
  },
  verbose: true,
  strict: true,
});

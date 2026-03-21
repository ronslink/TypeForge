import { defineConfig } from 'drizzle-kit';

// EU region configuration
export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle/eu',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_EU ?? 'postgresql://localhost:5432/typeforge_eu',
  },
  verbose: true,
  strict: true,
});

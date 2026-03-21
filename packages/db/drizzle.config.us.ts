import { defineConfig } from 'drizzle-kit';

// US region configuration
export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle/us',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_US ?? 'postgresql://localhost:5432/typeforge_us',
  },
  verbose: true,
  strict: true,
});

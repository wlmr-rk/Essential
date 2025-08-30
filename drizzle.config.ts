// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		// drizzle-kit reads process.env at run time; ensure .env is loaded in your shell
		url: process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
	},
	verbose: true,
	strict: true
});

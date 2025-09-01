// scripts/apply-rls.ts
// Script to apply Row Level Security policies to the database

import { readFileSync } from 'fs';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('Missing SUPABASE_DATABASE_URL or DATABASE_URL');
}

const client = postgres(connectionString, { prepare: false });

async function applyRLS() {
	try {
		console.log('Applying RLS policies...');
		
		// Read the RLS policies SQL file
		const rlsSQL = readFileSync('drizzle/rls_policies.sql', 'utf-8');
		
		// Execute the RLS policies
		await client.unsafe(rlsSQL);
		
		console.log('✅ RLS policies applied successfully');
		
		// Verify tables exist
		const result = await client`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name IN ('sleep_logs', 'habits', 'habit_logs', 'mood_logs', 'workout_logs')
			ORDER BY table_name;
		`;
		
		console.log('📋 Created tables:', result.map(r => r.table_name));
		
		// Verify RLS is enabled
		const rlsStatus = await client`
			SELECT schemaname, tablename, rowsecurity 
			FROM pg_tables 
			WHERE schemaname = 'public' 
			AND tablename IN ('sleep_logs', 'habits', 'habit_logs', 'mood_logs', 'workout_logs')
			ORDER BY tablename;
		`;
		
		console.log('🔒 RLS Status:');
		rlsStatus.forEach(table => {
			console.log(`  ${table.tablename}: ${table.rowsecurity ? '✅ Enabled' : '❌ Disabled'}`);
		});
		
	} catch (error) {
		console.error('❌ Error applying RLS policies:', error);
		process.exit(1);
	} finally {
		await client.end();
	}
}

applyRLS();
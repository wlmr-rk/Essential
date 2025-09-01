// scripts/verify-setup.ts
// Script to verify database setup and authentication helpers

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sleepLogs, habits, habitLogs, moodLogs, workoutLogs } from '../src/lib/server/db/schema.js';

// Load environment variables
config();

const connectionString = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('Missing SUPABASE_DATABASE_URL or DATABASE_URL');
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function verifySetup() {
	try {
		console.log('🔍 Verifying database setup...');
		
		// Test basic database connection
		console.log('Testing database connection...');
		const result = await client`SELECT NOW() as current_time`;
		console.log('✅ Database connection successful');
		console.log(`   Current time: ${result[0].current_time}`);
		
		// Test schema access (this will fail if tables don't exist)
		console.log('\nTesting schema access...');
		
		// Test each table by running a simple count query
		const tables = [
			{ name: 'sleep_logs', schema: sleepLogs },
			{ name: 'habits', schema: habits },
			{ name: 'habit_logs', schema: habitLogs },
			{ name: 'mood_logs', schema: moodLogs },
			{ name: 'workout_logs', schema: workoutLogs }
		];
		
		for (const table of tables) {
			try {
				const count = await db.select().from(table.schema).limit(1);
				console.log(`✅ ${table.name} table accessible`);
			} catch (error) {
				console.log(`❌ ${table.name} table error:`, error.message);
			}
		}
		
		console.log('\n✅ Database setup verification complete');
		
	} catch (error) {
		console.error('❌ Verification failed:', error);
		process.exit(1);
	} finally {
		await client.end();
	}
}

verifySetup();
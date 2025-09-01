// scripts/seed-habits.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { habits } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables directly
const connectionString = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('Missing SUPABASE_DATABASE_URL (pooled) or DATABASE_URL');
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

const userId = 'single-user';

const testHabits = [
	{ name: 'Morning Exercise', weight: 3 },
	{ name: 'Read for 30 minutes', weight: 2 },
	{ name: 'Drink 8 glasses of water', weight: 2 },
	{ name: 'Meditate', weight: 2 },
	{ name: 'No social media before noon', weight: 1 }
];

async function seedHabits() {
	console.log('Seeding habits...');
	
	// Check if habits already exist
	const existingHabits = await db
		.select()
		.from(habits)
		.where(eq(habits.userId, userId));
	
	if (existingHabits.length > 0) {
		console.log(`Found ${existingHabits.length} existing habits. Skipping seed.`);
		return;
	}
	
	// Insert test habits
	for (const habit of testHabits) {
		await db.insert(habits).values({
			userId,
			name: habit.name,
			weight: habit.weight
		});
		console.log(`Added habit: ${habit.name} (weight: ${habit.weight})`);
	}
	
	console.log('Habits seeded successfully!');
}

seedHabits()
	.catch(console.error)
	.finally(() => {
		client.end();
	});
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { User } from '@supabase/supabase-js';

export const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const user = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
	user.set(session?.user ?? null);
	loading.set(false);
});

// Get initial session
supabase.auth.getSession().then(({ data: { session } }) => {
	user.set(session?.user ?? null);
	loading.set(false);
});

export async function signOut() {
	await supabase.auth.signOut();
}
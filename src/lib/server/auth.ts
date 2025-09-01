// src/lib/server/auth.ts
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Create a Supabase server client for server-side operations
 */
export function createSupabaseServerClient(event: RequestEvent) {
	return createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet: Array<{ name: string; value: string; options: any }>) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);
}

/**
 * Require user authentication for server-side operations
 * Throws 401 error if user is not authenticated
 */
export async function requireUser(event?: RequestEvent) {
	// For Remote Functions, we need to get the event from the context
	// This is a simplified version - in practice, Remote Functions handle auth differently
	if (!event) {
		// In Remote Functions, we can access the user from the context
		// For now, we'll simulate this - in real implementation, this would be handled by SvelteKit
		throw error(401, 'Authentication required');
	}
	
	const supabase = createSupabaseServerClient(event);
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	
	if (authError || !user) {
		throw error(401, 'Authentication required');
	}
	
	return user;
}

/**
 * Get current user ID from SvelteKit Remote Functions context
 * In practice, Remote Functions have built-in auth handling
 */
export function getCurrentUserId(): string {
	// This is a placeholder implementation
	// In real Remote Functions, the user context is provided by the framework
	// For now, we'll return a placeholder that will be replaced during integration
	return 'current-user-id';
}
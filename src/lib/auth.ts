// src/lib/auth.ts
import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL
} from '$env/static/public';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Create a Supabase client for server-side operations
 * This is the ONLY file that should directly interact with Supabase
 */
export function createSupabaseServerClient(event: RequestEvent) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>
      ) => {
        for (const { name, value, options } of cookiesToSet) {
          // Ensure cookies are set on the response with path=/
          event.cookies.set(name, value, { ...options, path: '/' });
        }
      }
    }
  });
}

/**
 * Get the current session from cookies
 */
export async function getSessionFromCookies(event: RequestEvent) {
  const supabase = createSupabaseServerClient(event);
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Session error:', error);
    return { session: null, error: error.message };
  }

  return { session: data.session, error: null };
}

/**
 * Get the current user from cookies
 */
export async function getUserFromCookies(event: RequestEvent) {
  const supabase = createSupabaseServerClient(event);
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('User error:', error);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub(
  event: RequestEvent,
  redirectPath: string = '/dashboard'
) {
  const supabase = createSupabaseServerClient(event);

  // Build absolute redirect URL
  const origin = new URL(event.url).origin;
  const cleanPath = redirectPath.trim().replace(/\s+/g, '');
  const redirectTo = new URL(
    cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`,
    origin
  ).toString();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo }
  });

  if (error) {
    console.error('GitHub sign-in error:', error);
    return {
      ok: false as const,
      url: null as string | null,
      error: error.message
    };
  }

  return {
    ok: true as const,
    url: data.url ?? null,
    error: null as string | null
  };
}

/**
 * Sign out the current user
 */
export async function signOutUser(event: RequestEvent) {
  const supabase = createSupabaseServerClient(event);
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign-out error:', error);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, error: null };
}

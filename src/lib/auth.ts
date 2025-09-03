// src/lib/auth.ts
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Get the current session from cookies
 */
export async function getSessionFromCookies(event: RequestEvent) {
  const {
    data: { session },
    error
  } = await event.locals.supabase.auth.getSession();

  if (error) {
    console.error('Session error:', error);
    return { session: null, error: error.message };
  }

  return { session, error: null };
}

/**
 * Get the current user from cookies
 */
export async function getUserFromCookies(event: RequestEvent) {
  const {
    data: { user },
    error
  } = await event.locals.supabase.auth.getUser();

  if (error) {
    console.error('User error:', error);
    return { user: null, error: error.message };
  }

  return { user, error: null };
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub(event: RequestEvent, redirectPath: string = '/dashboard') {
  const { locals: { supabase }, url } = event;

  // Build absolute redirect URL
  const redirectTo = new URL(
    redirectPath.trim().replace(/\s+/g, ''),
    url.origin
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
  const { error } = await event.locals.supabase.auth.signOut();

  if (error) {
    console.error('Sign-out error:', error);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, error: null };
}
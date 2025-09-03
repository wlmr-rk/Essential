// src/lib/auth.ts
import type { RequestEvent } from '@sveltejs/kit';



/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub(event: RequestEvent, redirectPath: string = '/dashboard') {
  const { locals: { supabase }, url } = event;

  // The callback URL that Supabase will redirect to after authentication
  const callbackUrl = new URL('/auth/callback', url.origin);

  // The `next` parameter will be used by the callback to redirect the user
  // to the correct page after the session is created.
  callbackUrl.searchParams.set('next', redirectPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: callbackUrl.toString()
    }
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

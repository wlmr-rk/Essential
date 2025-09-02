// src/routes/login.remote.ts
import { command, getRequestEvent, query } from '$app/server';
import {
    getSessionFromCookies,
    getUserFromCookies,
    signInWithGitHub,
    signOutUser
} from '$lib/auth';
import { z } from 'zod';

// Validation schema for optional redirect path
const RedirectSchema = z.object({
  redirectPath: z.string().optional()
});

/**
 * Get the current session — remote query (no args)
 */
export const getSession = query(async () => {
  const event = getRequestEvent();
  if (!event) {
    // This should not happen inside a remote function, but fail safe.
    return { session: null, error: 'Missing RequestEvent' };
  }
  return await getSessionFromCookies(event);
});

/**
 * Get the current user — remote query (no args)
 */
export const getUser = query(async () => {
  const event = getRequestEvent();
  if (!event) {
    return { user: null, error: 'Missing RequestEvent' };
  }
  return await getUserFromCookies(event);
});

/**
 * Start GitHub OAuth — remote command (changes state)
 */
export const signInWithGithub = command(RedirectSchema, async ({ redirectPath }) => {
  const event = getRequestEvent();
  if (!event) {
    return {
      ok: false as const,
      url: null as string | null,
      error: 'Missing RequestEvent'
    };
  }
  return await signInWithGitHub(event, redirectPath);
});

/**
 * Sign out — remote command (changes state)
 */
export const signOut = command(async () => {
  const event = getRequestEvent();
  if (!event) {
    return { ok: false as const, error: 'Missing RequestEvent' };
    }
  return await signOutUser(event);
});

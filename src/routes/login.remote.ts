// src/routes/login.remote.ts
import { command, query } from '$app/server';
import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// Never touch `event` at module scope. Only inside handlers.

// Build a safe absolute redirect URL from the current request origin + a path.
function buildRedirect(event: RequestEvent, path: string | undefined) {
  const origin = new URL(event.url).origin;
  const cleanPath = (path ?? '/dashboard').trim().replace(/\s+/g, '');
  const url = new URL(
    cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`,
    origin
  );
  return url.toString();
}

// Create a Supabase client for this request. If event is somehow missing (HMR),
// return a client with no-op cookies so the dev server won't crash.
// We will still return "No request context" from handlers in that case.
function supabaseFor(event?: RequestEvent) {
  const cookies =
    event
      ? {
          getAll: () => event.cookies.getAll(),
          setAll: (
            cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>
          ) => {
            for (const { name, value, options } of cookiesToSet) {
              event.cookies.set(name, value, { ...options, path: '/' });
            }
          },
        }
      : {
          // no-op adapter to survive HMR/module eval without RequestEvent
          getAll: () => [],
          setAll: (_cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
            /* noop */
          },
        };

  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies,
  });
}

// Schemas
const RedirectSchema = z.object({
  redirectPath: z.string().optional(), // e.g., '/dashboard'
});

// Queries

export const getSession = query(z.object({}).optional(), async (_args, event) => {
  if (!event) return { session: null, error: 'No request context' };
  const supabase = supabaseFor(event);
  const { data, error } = await supabase.auth.getSession();
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
});

export const getUser = query(z.object({}).optional(), async (_args, event) => {
  if (!event) return { user: null, error: 'No request context' };
  const supabase = supabaseFor(event);
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
});

// Commands

export const signInWithGithub = command(
  RedirectSchema,
  async ({ redirectPath }, event) => {
    if (!event) {
      return {
        ok: false as const,
        url: null as string | null,
        error: 'No request context',
      };
    }

    const supabase = supabaseFor(event);
    const redirectTo = buildRedirect(event, redirectPath ?? '/dashboard');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo },
    });

    if (error) {
      return { ok: false as const, url: null as string | null, error: error.message };
    }
    return { ok: true as const, url: data.url ?? null, error: null as string | null };
  }
);

export const signOut = command(z.object({}).optional(), async (_args, event) => {
  if (!event) return { ok: false as const, error: 'No request context' };
  const supabase = supabaseFor(event);
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, error: null };
});

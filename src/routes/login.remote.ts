import { command } from '$app/server';
import { signOutUser } from '$lib/auth';
import { z } from 'zod';

const SignOutSchema = z.object({});

export const signOut = command(SignOutSchema, async (input, { event }) => {
  return await signOutUser(event);
});

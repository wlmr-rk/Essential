// src/routes/login/+page.server.ts
import { signInWithGitHub } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async (event) => {
    const { url } = await signInWithGitHub(event);
    if (url) {
      throw redirect(303, url);
    }
  },
};

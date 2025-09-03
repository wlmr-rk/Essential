// src/routes/dashboard/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  const session = await getSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  return { session };
};

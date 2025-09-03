// src/routes/dashboard/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getUser } }) => {
  const user = await getUser();

  if (!user) {
    throw redirect(303, '/login');
  }

  return { user };
};

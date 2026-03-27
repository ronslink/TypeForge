import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Get auth state from Clerk
  const auth = locals.auth();
  
  // If not logged in, redirect to sign-in
  if (!auth.userId) {
    throw redirect(303, '/sign-in?redirect_url=/onboarding');
  }

  return {
    userId: auth.userId
  };
};

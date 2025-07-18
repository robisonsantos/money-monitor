import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id; // User is guaranteed to exist due to layout check
  
  // Return minimal data - investments will be loaded client-side for better performance
  return {
    user: locals.user
  };
}; 
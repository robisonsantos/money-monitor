import { investmentDb } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id; // User is guaranteed to exist due to layout check
  
  // Load all investments on server to prevent flicker from client-side loading
  const allInvestments = await investmentDb.getAllInvestments(userId);
  
  return {
    allInvestments
  };
}; 
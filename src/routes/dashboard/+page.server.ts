import { investmentDb } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id; // User is guaranteed to exist due to layout check
  
  // Use Promise.all to run both queries in parallel for better performance
  const [investments, recentEntries] = await Promise.all([
    investmentDb.getAllInvestments(userId),
    investmentDb.getRecentInvestmentsWithChanges(userId, 20)
  ]);
  
  return {
    investments,
    recentEntries
  };
}; 
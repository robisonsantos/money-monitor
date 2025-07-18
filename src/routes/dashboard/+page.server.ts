import { investmentDb } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id; // User is guaranteed to exist due to layout check
  
  // Only load recent entries for now - load full data on demand via API
  const recentEntries = await investmentDb.getRecentInvestmentsWithChanges(userId, 20);
  
  return {
    recentEntries
  };
}; 
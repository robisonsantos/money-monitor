import { investmentDb } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user!.id; // User is guaranteed to exist due to layout check
  
  const investments = await investmentDb.getAllInvestments(userId);
  
  // Load recent entries for the infinite scroll component
  const recentEntries = await investmentDb.getInvestmentsPaginated(userId, 20, 0);
  
  // Calculate changes for recent entries
  const enrichedEntries = await Promise.all(
    recentEntries.map(async (investment, index) => {
      const investmentWithPrevious = await investmentDb.getInvestmentWithPrevious(userId, investment.date);
      const change = investmentWithPrevious?.prev_value 
        ? investment.value - investmentWithPrevious.prev_value 
        : 0;
      const changePercent = investmentWithPrevious?.prev_value 
        ? (change / investmentWithPrevious.prev_value) * 100 
        : 0;
      
      return {
        ...investment,
        change,
        changePercent
      };
    })
  );
  
  return {
    investments,
    recentEntries: enrichedEntries
  };
}; 
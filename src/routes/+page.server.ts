import { investmentDb } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const investments = investmentDb.getAllInvestments();
  
  // Load recent entries for the infinite scroll component
  const recentEntries = investmentDb.getInvestmentsPaginated(20, 0);
  
  // Calculate changes for recent entries
  const enrichedEntries = recentEntries.map((investment, index) => {
    const investmentWithPrevious = investmentDb.getInvestmentWithPrevious(investment.date);
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
  });
  
  return {
    investments,
    recentEntries: enrichedEntries
  };
};
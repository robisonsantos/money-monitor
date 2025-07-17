import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    
    // Validate parameters
    if (limit < 1 || limit > 100) {
      return json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
    }
    
    if (offset < 0) {
      return json({ error: 'Offset must be non-negative' }, { status: 400 });
    }
    
    const investments = investmentDb.getInvestmentsPaginated(limit, offset);
    
    // Calculate changes for each investment efficiently
    const enrichedInvestments = investments.map((investment) => {
      let change = 0;
      let changePercent = 0;
      
      // Get the investment with its previous value in a single query
      const investmentWithPrev = investmentDb.getInvestmentWithPrevious(investment.date);
      
      if (investmentWithPrev && investmentWithPrev.prev_value !== null) {
        change = investment.value - investmentWithPrev.prev_value;
        changePercent = (change / investmentWithPrev.prev_value) * 100;
      }
      
      return {
        ...investment,
        change,
        changePercent
      };
    });
    
    // Get total count for pagination info
    const totalCount = investmentDb.getAllInvestments().length;
    const hasMore = offset + limit < totalCount;
    
    return json({
      investments: enrichedInvestments,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching recent investments:', error);
    return json({ error: 'Failed to fetch recent investments' }, { status: 500 });
  }
}; 
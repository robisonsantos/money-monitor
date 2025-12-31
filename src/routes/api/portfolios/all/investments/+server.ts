import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get aggregated investments across all portfolios for the user
    const aggregatedInvestments = await investmentDb.getAggregatedInvestments(locals.user.id);

    return json(aggregatedInvestments);
  } catch (error) {
    console.error('Error fetching aggregated investments:', error);
    return json({ error: 'Unable to retrieve aggregated investments' }, { status: 500 });
  }
};

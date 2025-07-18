import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const { date } = params;
    const investment = await investmentDb.getInvestment(locals.user.id, date);
    
    if (!investment) {
      return json({ error: 'Investment not found' }, { status: 404 });
    }
    
    return json(investment);
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error('Error fetching investment:', error);
    return json({ error: 'Unable to retrieve data' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const { date } = params;
    const investment = await investmentDb.getInvestment(locals.user.id, date);
    
    if (!investment) {
      return json({ error: 'Investment not found' }, { status: 404 });
    }
    
    await investmentDb.deleteInvestment(locals.user.id, date);
    return json({ message: 'Investment deleted successfully' });
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error('Error deleting investment:', error);
    return json({ error: 'Unable to delete data' }, { status: 500 });
  }
};
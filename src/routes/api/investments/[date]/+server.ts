import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { date } = params;
    const investment = investmentDb.getInvestment(date);
    
    if (!investment) {
      return json({ error: 'Investment not found' }, { status: 404 });
    }
    
    return json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    return json({ error: 'Failed to fetch investment' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { date } = params;
    const investment = investmentDb.getInvestment(date);
    
    if (!investment) {
      return json({ error: 'Investment not found' }, { status: 404 });
    }
    
    investmentDb.deleteInvestment(date);
    return json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    return json({ error: 'Failed to delete investment' }, { status: 500 });
  }
};
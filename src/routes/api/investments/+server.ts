import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const investments = investmentDb.getAllInvestments();
    return json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return json({ error: 'Failed to fetch investments' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { date, value } = await request.json();
    
    if (!date || value === undefined) {
      return json({ error: 'Date and value are required' }, { status: 400 });
    }

    if (typeof value !== 'number' || value < 0) {
      return json({ error: 'Value must be a positive number' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return json({ error: 'Date must be in YYYY-MM-DD format' }, { status: 400 });
    }

    investmentDb.addInvestment(date, value);
    const investment = investmentDb.getInvestment(date);
    
    return json(investment, { status: 201 });
  } catch (error) {
    console.error('Error adding investment:', error);
    return json({ error: 'Failed to add investment' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async () => {
  try {
    investmentDb.clearAllInvestments();
    return json({ message: 'All investments cleared' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing investments:', error);
    return json({ error: 'Failed to clear investments' }, { status: 500 });
  }
};
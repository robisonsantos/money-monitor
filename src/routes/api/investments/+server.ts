import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const investments = investmentDb.getAllInvestments(locals.user.id);
    return json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return json({ error: 'Failed to fetch investments' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

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

    // Check if investment already exists for this date (user-scoped)
    const existingInvestment = investmentDb.getInvestment(locals.user.id, date);
    if (existingInvestment) {
      return json({ 
        error: `An investment entry already exists for ${date}. Use the edit functionality to update it.`,
        existingValue: existingInvestment.value
      }, { status: 409 }); // 409 Conflict
    }

    investmentDb.addInvestment(locals.user.id, date, value);
    const investment = investmentDb.getInvestment(locals.user.id, date);
    
    return json(investment, { status: 201 });
  } catch (error) {
    console.error('Error adding investment:', error);
    return json({ error: 'Failed to add investment' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

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

    // Check if investment exists (user-scoped)
    const existingInvestment = investmentDb.getInvestment(locals.user.id, date);
    if (!existingInvestment) {
      return json({ error: 'Investment not found for this date' }, { status: 404 });
    }

    investmentDb.addInvestment(locals.user.id, date, value); // This will update the existing entry
    const updatedInvestment = investmentDb.getInvestment(locals.user.id, date);
    
    return json(updatedInvestment, { status: 200 });
  } catch (error) {
    console.error('Error updating investment:', error);
    return json({ error: 'Failed to update investment' }, { status: 500 });
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
import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const investments = await investmentDb.getAllInvestments(locals.user.id);
    return json(investments);
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error('Error fetching investments:', error);
    return json({ error: 'Unable to retrieve data' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const { date, value, carryOverWeekend, weekendDates } = await request.json();
    
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
    const existingInvestment = await investmentDb.getInvestment(locals.user.id, date);
    if (existingInvestment) {
      return json({ 
        error: `An investment entry already exists for ${date}. Use the edit functionality to update it.`,
        existingValue: existingInvestment.value
      }, { status: 409 }); // 409 Conflict
    }

    // If weekend carry-over is requested, validate weekend dates and check for conflicts
    if (carryOverWeekend && weekendDates) {
      // Validate weekend date formats
      if (!dateRegex.test(weekendDates.saturday) || !dateRegex.test(weekendDates.sunday)) {
        return json({ error: 'Weekend dates must be in YYYY-MM-DD format' }, { status: 400 });
      }

      // Check for existing weekend entries
      const saturdayExists = await investmentDb.getInvestment(locals.user.id, weekendDates.saturday);
      const sundayExists = await investmentDb.getInvestment(locals.user.id, weekendDates.sunday);

      if (saturdayExists || sundayExists) {
        const existingDays = [];
        if (saturdayExists) existingDays.push('Saturday');
        if (sundayExists) existingDays.push('Sunday');
        return json({ 
          error: `Cannot carry over to weekend: entries already exist for ${existingDays.join(' and ')}`
        }, { status: 409 });
      }

      // Create all three entries (Friday + Saturday + Sunday)
      const entriesToCreate = [
        { date, value },
        { date: weekendDates.saturday, value },
        { date: weekendDates.sunday, value }
      ];

      await investmentDb.bulkInsertInvestments(locals.user.id, entriesToCreate);
      
      // Return the Friday entry as the primary response
      const investment = await investmentDb.getInvestment(locals.user.id, date);
      return json({
        ...investment,
        weekendCarryOver: {
          saturday: weekendDates.saturday,
          sunday: weekendDates.sunday,
          message: 'Value also saved for Saturday and Sunday'
        }
      }, { status: 201 });
    }

    // Standard single entry creation
    await investmentDb.addInvestment(locals.user.id, date, value);
    const investment = await investmentDb.getInvestment(locals.user.id, date);
    
    return json(investment, { status: 201 });
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error('Error adding investment:', error);
    return json({ error: 'Unable to save data' }, { status: 500 });
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
    const existingInvestment = await investmentDb.getInvestment(locals.user.id, date);
    if (!existingInvestment) {
      return json({ error: 'Investment not found for this date' }, { status: 404 });
    }

    await investmentDb.addInvestment(locals.user.id, date, value); // This will update the existing entry
    const updatedInvestment = await investmentDb.getInvestment(locals.user.id, date);
    
    return json(updatedInvestment, { status: 200 });
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error('Error updating investment:', error);
    return json({ error: 'Unable to update data' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    await investmentDb.clearAllInvestments(locals.user.id);
    return json({ message: 'All investments cleared' }, { status: 200 });
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error('Error clearing investments:', error);
    return json({ error: 'Unable to clear data' }, { status: 500 });
  }
};
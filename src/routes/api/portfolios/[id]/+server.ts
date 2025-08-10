import { json } from '@sveltejs/kit';
import { portfolioDb, investmentDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const portfolioId = parseInt(params.id);
    if (isNaN(portfolioId)) {
      return json({ error: 'Invalid portfolio ID' }, { status: 400 });
    }

    const portfolio = await portfolioDb.getPortfolioWithStats(locals.user.id, portfolioId);
    if (!portfolio) {
      return json({ error: 'Portfolio not found' }, { status: 404 });
    }

    return json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return json({ error: 'Unable to retrieve portfolio' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const portfolioId = parseInt(params.id);
    if (isNaN(portfolioId)) {
      return json({ error: 'Invalid portfolio ID' }, { status: 400 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return json({ error: 'Portfolio name is required' }, { status: 400 });
    }

    // Trim and validate name
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return json({ error: 'Portfolio name cannot be empty' }, { status: 400 });
    }

    if (trimmedName.length > 255) {
      return json({ error: 'Portfolio name must be 255 characters or less' }, { status: 400 });
    }

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await portfolioDb.getPortfolio(locals.user.id, portfolioId);
    if (!existingPortfolio) {
      return json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Check if another portfolio with this name already exists for this user
    const duplicatePortfolio = await portfolioDb.getPortfolioByName(locals.user.id, trimmedName);
    if (duplicatePortfolio && duplicatePortfolio.id !== portfolioId) {
      return json({ error: 'A portfolio with this name already exists' }, { status: 409 });
    }

    // Update the portfolio
    const updatedPortfolio = await portfolioDb.updatePortfolio(locals.user.id, portfolioId, trimmedName);
    if (!updatedPortfolio) {
      return json({ error: 'Failed to update portfolio' }, { status: 500 });
    }

    return json(updatedPortfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);

    // Handle database constraint errors
    if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
      return json({ error: 'A portfolio with this name already exists' }, { status: 409 });
    }

    return json({ error: 'Unable to update portfolio' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const portfolioId = parseInt(params.id);
    if (isNaN(portfolioId)) {
      return json({ error: 'Invalid portfolio ID' }, { status: 400 });
    }

    // Check if portfolio exists and belongs to user
    const portfolio = await portfolioDb.getPortfolio(locals.user.id, portfolioId);
    if (!portfolio) {
      return json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Delete the portfolio (this will check for investments and last portfolio)
    const deleted = await portfolioDb.deletePortfolio(locals.user.id, portfolioId);
    if (!deleted) {
      return json({ error: 'Failed to delete portfolio' }, { status: 500 });
    }

    return json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);

    if (error.message.includes('Cannot delete portfolio with existing investments')) {
      return json({
        error: 'Cannot delete portfolio with existing investments. Please move or delete all investments first.'
      }, { status: 409 });
    }

    if (error.message.includes('Cannot delete the last portfolio')) {
      return json({
        error: 'Cannot delete your last portfolio. Create another portfolio first.'
      }, { status: 409 });
    }

    return json({ error: 'Unable to delete portfolio' }, { status: 500 });
  }
};

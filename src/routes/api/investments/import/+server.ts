import { json } from '@sveltejs/kit';
import { investmentDb } from '$lib/database';
import { parseCSV } from '$lib/utils';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return json({ error: 'File must be a CSV file' }, { status: 400 });
    }

    if (file.size === 0) {
      return json({ error: 'File is empty' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return json({ error: 'File size too large. Maximum 5MB allowed' }, { status: 400 });
    }

    const csvContent = await file.text();
    const parseResult = parseCSV(csvContent);

    if (!parseResult.isValid) {
      return json({ 
        error: 'CSV validation failed', 
        errors: parseResult.errors 
      }, { status: 400 });
    }

    if (parseResult.data.length === 0) {
      return json({ error: 'No valid data found in CSV' }, { status: 400 });
    }

    // Import the data using bulk insert (will override existing dates)
    const insertedCount = await investmentDb.bulkInsertInvestments(locals.user.id, parseResult.data);

    return json({ 
      message: `Successfully imported ${insertedCount} investment entries`,
      importedCount: insertedCount,
      totalRows: parseResult.data.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error importing CSV:', error);
    return json({ error: 'Failed to import CSV file' }, { status: 500 });
  }
}; 
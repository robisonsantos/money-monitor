import { json } from "@sveltejs/kit";
import { investmentDb, portfolioDb } from "$lib/database";
import { parseCSV } from "$lib/utils";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const portfolioId = formData.get("portfolioId") as string;

    if (!file) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate portfolio ID if provided
    let targetPortfolioId: number;
    if (portfolioId) {
      const portfolioIdNum = parseInt(portfolioId);
      if (isNaN(portfolioIdNum)) {
        return json({ error: "Invalid portfolio ID" }, { status: 400 });
      }

      // Verify portfolio belongs to user
      const portfolio = await portfolioDb.getPortfolio(locals.user.id, portfolioIdNum);
      if (!portfolio) {
        return json({ error: "Portfolio not found or access denied" }, { status: 404 });
      }
      targetPortfolioId = portfolioIdNum;
    } else {
      // If no portfolio specified, use default portfolio for backward compatibility
      const defaultPortfolio = await portfolioDb.ensureDefaultPortfolio(locals.user.id);
      targetPortfolioId = defaultPortfolio.id;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return json({ error: "File must be a CSV file" }, { status: 400 });
    }

    if (file.size === 0) {
      return json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return json({ error: "File size too large. Maximum 5MB allowed" }, { status: 400 });
    }

    const csvContent = await file.text();
    const parseResult = parseCSV(csvContent);

    if (!parseResult.isValid) {
      return json(
        {
          error: "CSV validation failed",
          errors: parseResult.errors,
        },
        { status: 400 },
      );
    }

    if (parseResult.data.length === 0) {
      return json({ error: "No valid data found in CSV" }, { status: 400 });
    }

    // Import the data to the specified portfolio using bulk insert (will override existing dates)
    const insertedCount = await investmentDb.bulkInsertInvestmentsToPortfolio(
      locals.user.id,
      targetPortfolioId,
      parseResult.data,
    );

    return json(
      {
        message: `Successfully imported ${insertedCount} investment entries`,
        importedCount: insertedCount,
        totalRows: parseResult.data.length,
      },
      { status: 200 },
    );
  } catch (error) {
    // Log detailed error for debugging but don't expose to client
    console.error("Error importing CSV:", error);
    return json({ error: "Unable to import file" }, { status: 500 });
  }
};

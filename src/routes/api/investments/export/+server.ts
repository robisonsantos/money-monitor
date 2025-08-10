import { investmentDb, portfolioDb } from "$lib/database";
import { aggregateInvestments, generateCSV, type AggregationPeriod, type FilterPeriod } from "$lib/utils";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const period = (url.searchParams.get("period") as AggregationPeriod) || "daily";
    const filter = (url.searchParams.get("filter") as FilterPeriod) || "all";
    const portfolioId = url.searchParams.get("portfolioId");

    // Validate period and filter
    const validPeriods = ["daily", "weekly", "monthly"];
    const validFilters = ["7d", "30d", "60d", "4w", "12w", "24w", "3m", "6m", "12m", "all"];

    if (!validPeriods.includes(period)) {
      return new Response(JSON.stringify({ error: "Invalid period" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!validFilters.includes(filter)) {
      return new Response(JSON.stringify({ error: "Invalid filter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get investments from specific portfolio or all portfolios
    let allInvestments;
    let portfolioName = "All Portfolios";

    if (portfolioId) {
      const portfolioIdNum = parseInt(portfolioId);
      if (isNaN(portfolioIdNum)) {
        return new Response(JSON.stringify({ error: "Invalid portfolio ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify portfolio belongs to user and get its name
      const portfolio = await portfolioDb.getPortfolio(locals.user.id, portfolioIdNum);
      if (!portfolio) {
        return new Response(JSON.stringify({ error: "Portfolio not found or access denied" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      portfolioName = portfolio.name;
      allInvestments = await investmentDb.getAllInvestmentsFromPortfolio(locals.user.id, portfolioIdNum);
    } else {
      // Fallback to all investments for backward compatibility
      allInvestments = await investmentDb.getAllInvestments(locals.user.id);
    }

    const aggregatedData = aggregateInvestments(allInvestments, period, filter);

    if (aggregatedData.length === 0) {
      return new Response(JSON.stringify({ error: "No data available for export" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert to CSV format
    const csvData = aggregatedData.map((item) => ({
      date: item.date,
      value: item.value,
    }));

    const csvContent = generateCSV(csvData);

    // Generate filename with current date, filter info, and portfolio name
    const currentDate = new Date().toISOString().split("T")[0];
    const filterSuffix = filter === "all" ? "all-time" : filter;
    const portfolioSuffix = portfolioId ? portfolioName.toLowerCase().replace(/\s+/g, "-") : "all-portfolios";
    const filename = `investments-${portfolioSuffix}-${period}-${filterSuffix}-${currentDate}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return new Response(JSON.stringify({ error: "Failed to export CSV file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

import { p as portfolioDb, i as investmentDb } from "../../../../../chunks/database.js";
import { a as aggregateInvestments, g as generateCSV } from "../../../../../chunks/utils.js";
const GET = async ({ url, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const period = url.searchParams.get("period") || "daily";
    const filter = url.searchParams.get("filter") || "all";
    const portfolioId = url.searchParams.get("portfolioId");
    const validPeriods = ["daily", "weekly", "monthly"];
    const validFilters = ["7d", "30d", "60d", "4w", "12w", "24w", "3m", "6m", "12m", "all"];
    if (!validPeriods.includes(period)) {
      return new Response(JSON.stringify({ error: "Invalid period" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!validFilters.includes(filter)) {
      return new Response(JSON.stringify({ error: "Invalid filter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let allInvestments;
    let portfolioName = "All Portfolios";
    if (portfolioId) {
      const portfolioIdNum = parseInt(portfolioId);
      if (isNaN(portfolioIdNum)) {
        return new Response(JSON.stringify({ error: "Invalid portfolio ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const portfolio = await portfolioDb.getPortfolio(locals.user.id, portfolioIdNum);
      if (!portfolio) {
        return new Response(JSON.stringify({ error: "Portfolio not found or access denied" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      portfolioName = portfolio.name;
      allInvestments = await investmentDb.getAllInvestmentsFromPortfolio(locals.user.id, portfolioIdNum);
    } else {
      allInvestments = await investmentDb.getAllInvestments(locals.user.id);
    }
    const aggregatedData = aggregateInvestments(allInvestments, period, filter);
    if (aggregatedData.length === 0) {
      return new Response(JSON.stringify({ error: "No data available for export" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const csvData = aggregatedData.map((item) => ({
      date: item.date,
      value: item.value
    }));
    const csvContent = generateCSV(csvData);
    const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const filterSuffix = filter === "all" ? "all-time" : filter;
    const portfolioSuffix = portfolioId ? portfolioName.toLowerCase().replace(/\s+/g, "-") : "all-portfolios";
    const filename = `investments-${portfolioSuffix}-${period}-${filterSuffix}-${currentDate}.csv`;
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return new Response(JSON.stringify({ error: "Failed to export CSV file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
export {
  GET
};

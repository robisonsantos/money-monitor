import { json } from "@sveltejs/kit";
import { p as portfolioDb } from "../../../../chunks/database.js";
const GET = async ({ locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const portfolios = await portfolioDb.getUserPortfolios(locals.user.id);
    return json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return json({ error: "Unable to retrieve portfolios" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const { name } = await request.json();
    if (!name || typeof name !== "string") {
      return json({ error: "Portfolio name is required" }, { status: 400 });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return json({ error: "Portfolio name cannot be empty" }, { status: 400 });
    }
    if (trimmedName.length > 255) {
      return json({ error: "Portfolio name must be 255 characters or less" }, { status: 400 });
    }
    const existingPortfolio = await portfolioDb.getPortfolioByName(locals.user.id, trimmedName);
    if (existingPortfolio) {
      return json({ error: "A portfolio with this name already exists" }, { status: 409 });
    }
    const portfolio = await portfolioDb.createPortfolio(locals.user.id, trimmedName);
    return json(portfolio, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
      return json({ error: "A portfolio with this name already exists" }, { status: 409 });
    }
    return json({ error: "Unable to create portfolio" }, { status: 500 });
  }
};
export {
  GET,
  POST
};

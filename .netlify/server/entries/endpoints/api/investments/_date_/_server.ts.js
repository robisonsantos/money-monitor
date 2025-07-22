import { json } from "@sveltejs/kit";
import { i as investmentDb } from "../../../../../chunks/database.js";
const GET = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const { date } = params;
    const investment = await investmentDb.getInvestment(locals.user.id, date);
    if (!investment) {
      return json({ error: "Investment not found" }, { status: 404 });
    }
    return json(investment);
  } catch (error) {
    console.error("Error fetching investment:", error);
    return json({ error: "Unable to retrieve data" }, { status: 500 });
  }
};
const DELETE = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const { date } = params;
    const investment = await investmentDb.getInvestment(locals.user.id, date);
    if (!investment) {
      return json({ error: "Investment not found" }, { status: 404 });
    }
    await investmentDb.deleteInvestment(locals.user.id, date);
    return json({ message: "Investment deleted successfully" });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return json({ error: "Unable to delete data" }, { status: 500 });
  }
};
export {
  DELETE,
  GET
};

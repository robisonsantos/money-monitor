import { json } from "@sveltejs/kit";
import { i as investmentDb } from "../../../../chunks/database.js";
const GET = async ({ locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const investments = await investmentDb.getAllInvestments(locals.user.id);
    return json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    return json({ error: "Unable to retrieve data" }, { status: 500 });
  }
};
const POST = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const { date, value } = await request.json();
    if (!date || value === void 0) {
      return json({ error: "Date and value are required" }, { status: 400 });
    }
    if (typeof value !== "number" || value < 0) {
      return json({ error: "Value must be a positive number" }, { status: 400 });
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return json({ error: "Date must be in YYYY-MM-DD format" }, { status: 400 });
    }
    const existingInvestment = await investmentDb.getInvestment(locals.user.id, date);
    if (existingInvestment) {
      return json({
        error: `An investment entry already exists for ${date}. Use the edit functionality to update it.`,
        existingValue: existingInvestment.value
      }, { status: 409 });
    }
    await investmentDb.addInvestment(locals.user.id, date, value);
    const investment = await investmentDb.getInvestment(locals.user.id, date);
    return json(investment, { status: 201 });
  } catch (error) {
    console.error("Error adding investment:", error);
    return json({ error: "Unable to save data" }, { status: 500 });
  }
};
const PUT = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const { date, value } = await request.json();
    if (!date || value === void 0) {
      return json({ error: "Date and value are required" }, { status: 400 });
    }
    if (typeof value !== "number" || value < 0) {
      return json({ error: "Value must be a positive number" }, { status: 400 });
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return json({ error: "Date must be in YYYY-MM-DD format" }, { status: 400 });
    }
    const existingInvestment = await investmentDb.getInvestment(locals.user.id, date);
    if (!existingInvestment) {
      return json({ error: "Investment not found for this date" }, { status: 404 });
    }
    await investmentDb.addInvestment(locals.user.id, date, value);
    const updatedInvestment = await investmentDb.getInvestment(locals.user.id, date);
    return json(updatedInvestment, { status: 200 });
  } catch (error) {
    console.error("Error updating investment:", error);
    return json({ error: "Unable to update data" }, { status: 500 });
  }
};
const DELETE = async ({ locals }) => {
  try {
    if (!locals.user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    await investmentDb.clearAllInvestments(locals.user.id);
    return json({ message: "All investments cleared" }, { status: 200 });
  } catch (error) {
    console.error("Error clearing investments:", error);
    return json({ error: "Unable to clear data" }, { status: 500 });
  }
};
export {
  DELETE,
  GET,
  POST,
  PUT
};

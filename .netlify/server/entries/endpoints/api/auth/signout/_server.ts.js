import { json } from "@sveltejs/kit";
import { s as sessionDb } from "../../../../../chunks/database.js";
const POST = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get("session");
    if (sessionToken) {
      await sessionDb.deleteSession(sessionToken);
    }
    cookies.delete("session", { path: "/" });
    return json({ success: true });
  } catch (error) {
    console.error("Signout error:", error);
    cookies.delete("session", { path: "/" });
    return json({ success: true });
  }
};
export {
  POST
};

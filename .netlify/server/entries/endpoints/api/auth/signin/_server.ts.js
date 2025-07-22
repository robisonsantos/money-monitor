import { json } from "@sveltejs/kit";
import { u as userDb, s as sessionDb } from "../../../../../chunks/database.js";
import { g as getClientIdentifier, a as authRateLimiter, c as createRateLimitResponse } from "../../../../../chunks/rateLimit.js";
import { s as sanitizeEmail, a as sanitizeText } from "../../../../../chunks/sanitize.js";
const POST = async ({ request, cookies }) => {
  const clientId = getClientIdentifier(request);
  const rateLimitCheck = authRateLimiter.check(clientId);
  if (rateLimitCheck.isLimited) {
    return createRateLimitResponse(rateLimitCheck.remaining, rateLimitCheck.resetTime);
  }
  try {
    const { email, password } = await request.json();
    const cleanEmail = sanitizeEmail(email || "");
    const cleanPassword = sanitizeText(password || "");
    if (!cleanEmail || !cleanPassword) {
      authRateLimiter.record(clientId);
      return json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = await userDb.authenticateUser(cleanEmail, cleanPassword);
    if (!user) {
      authRateLimiter.record(clientId);
      return json({ error: "Invalid email or password" }, { status: 401 });
    }
    authRateLimiter.reset(clientId);
    const sessionToken = sessionDb.generateSessionToken();
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await sessionDb.createSession(user.id, sessionToken, expiresAt);
    cookies.set("session", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Enable secure flag in production
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7
      // 7 days (reduced from 30 days)
    });
    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    authRateLimiter.record(clientId);
    console.error("Signin error:", error);
    return json({ error: "Authentication failed" }, { status: 500 });
  }
};
export {
  POST
};

import { json } from "@sveltejs/kit";
import { u as userDb, s as sessionDb } from "../../../../../chunks/database.js";
import { g as getClientIdentifier, a as authRateLimiter, c as createRateLimitResponse } from "../../../../../chunks/rateLimit.js";
import { s as sanitizeEmail, a as sanitizeText, b as sanitizeName } from "../../../../../chunks/sanitize.js";
const POST = async ({ request, cookies }) => {
  const clientId = getClientIdentifier(request);
  const rateLimitCheck = authRateLimiter.check(clientId);
  if (rateLimitCheck.isLimited) {
    return createRateLimitResponse(rateLimitCheck.remaining, rateLimitCheck.resetTime);
  }
  try {
    const { email, password, name } = await request.json();
    const cleanEmail = sanitizeEmail(email || "");
    const cleanPassword = sanitizeText(password || "");
    const cleanName = sanitizeName(name || "");
    if (!cleanEmail || !cleanPassword) {
      authRateLimiter.record(clientId);
      return json({ error: "Email and password are required" }, { status: 400 });
    }
    if (cleanPassword.length < 12) {
      authRateLimiter.record(clientId);
      return json({ error: "Password must be at least 12 characters" }, { status: 400 });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(cleanPassword)) {
      authRateLimiter.record(clientId);
      return json({
        error: "Password must contain uppercase, lowercase, number, and special character"
      }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      authRateLimiter.record(clientId);
      return json({ error: "Invalid email format" }, { status: 400 });
    }
    const existingUser = await userDb.getUserByEmail(cleanEmail);
    if (existingUser) {
      authRateLimiter.record(clientId);
      return json({ error: "User with this email already exists" }, { status: 400 });
    }
    const user = await userDb.createUser(cleanEmail, cleanPassword, cleanName);
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
    console.error("Signup error:", error);
    return json({ error: "Registration failed" }, { status: 500 });
  }
};
export {
  POST
};

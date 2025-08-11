import { s as sessionDb, u as userDb } from "./database.js";
const handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get("session");
  if (sessionToken) {
    try {
      const session = await sessionDb.getSession(sessionToken);
      if (session) {
        const user = await userDb.getUserById(session.user_id);
        if (user) {
          event.locals.user = {
            id: user.id,
            email: user.email,
            name: user.name
          };
          const oneDayFromNow = /* @__PURE__ */ new Date();
          oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
          if (session.expires_at < oneDayFromNow) {
            const newExpiresAt = /* @__PURE__ */ new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + 7);
            await sessionDb.updateSessionExpiration(sessionToken, newExpiresAt);
          }
        }
      } else {
        event.cookies.delete("session", { path: "/" });
      }
    } catch (error) {
      console.error("Session validation error:", error);
      event.cookies.delete("session", { path: "/" });
    }
  }
  const response = await resolve(event);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
};
export {
  handle
};

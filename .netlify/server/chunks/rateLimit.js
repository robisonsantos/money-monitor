class RateLimiter {
  attempts = /* @__PURE__ */ new Map();
  windowMs;
  maxAttempts;
  constructor(windowMs = 15 * 60 * 1e3, maxAttempts = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    setInterval(() => this.cleanup(), 5 * 60 * 1e3);
  }
  /**
   * Check if an IP/identifier is rate limited
   * @param identifier - Usually IP address or user identifier
   * @returns Object with isLimited boolean and remaining attempts
   */
  check(identifier) {
    const now = Date.now();
    const entry = this.attempts.get(identifier);
    if (!entry || now > entry.resetTime) {
      const newEntry = {
        count: 0,
        resetTime: now + this.windowMs
      };
      this.attempts.set(identifier, newEntry);
      return {
        isLimited: false,
        remaining: this.maxAttempts,
        resetTime: newEntry.resetTime
      };
    }
    const isLimited = entry.count >= this.maxAttempts;
    const remaining = Math.max(0, this.maxAttempts - entry.count);
    return {
      isLimited,
      remaining,
      resetTime: entry.resetTime
    };
  }
  /**
   * Record an attempt for an identifier
   * @param identifier - Usually IP address or user identifier
   */
  record(identifier) {
    const now = Date.now();
    const entry = this.attempts.get(identifier);
    if (!entry || now > entry.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      entry.count++;
    }
  }
  /**
   * Reset attempts for an identifier (e.g., on successful login)
   * @param identifier - Usually IP address or user identifier
   */
  reset(identifier) {
    this.attempts.delete(identifier);
  }
  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
  /**
   * Get current stats for monitoring
   */
  getStats() {
    return {
      totalEntries: this.attempts.size,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }
}
const authRateLimiter = new RateLimiter(15 * 60 * 1e3, 5);
new RateLimiter(60 * 1e3, 100);
function getClientIdentifier(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
function createRateLimitResponse(remaining, resetTime) {
  const resetTimeSeconds = Math.ceil((resetTime - Date.now()) / 1e3);
  return new Response(
    JSON.stringify({
      error: "Too many attempts. Please try again later.",
      retryAfter: resetTimeSeconds
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": resetTimeSeconds.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString()
      }
    }
  );
}
export {
  authRateLimiter as a,
  createRateLimitResponse as c,
  getClientIdentifier as g
};

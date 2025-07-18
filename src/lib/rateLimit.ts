interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxAttempts: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 5) {
    this.windowMs = windowMs; // 15 minutes default
    this.maxAttempts = maxAttempts; // 5 attempts default
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if an IP/identifier is rate limited
   * @param identifier - Usually IP address or user identifier
   * @returns Object with isLimited boolean and remaining attempts
   */
  check(identifier: string): { isLimited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // If no entry exists or window has expired, create/reset entry
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
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

    // Check if limit exceeded
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
  record(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry if none exists or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      // Increment existing entry
      entry.count++;
    }
  }

  /**
   * Reset attempts for an identifier (e.g., on successful login)
   * @param identifier - Usually IP address or user identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
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
  getStats(): { totalEntries: number; memoryUsage: number } {
    return {
      totalEntries: this.attempts.size,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const generalRateLimiter = new RateLimiter(60 * 1000, 100); // 100 requests per minute

/**
 * Get client identifier for rate limiting (IP address with fallbacks)
 * @param request - Request object
 * @returns Client identifier string
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for proxy/CDN scenarios)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback to 'unknown' if no IP can be determined
  return 'unknown';
}

/**
 * Create rate limit response with appropriate headers
 * @param remaining - Remaining attempts
 * @param resetTime - When the rate limit resets
 * @returns Response object
 */
export function createRateLimitResponse(remaining: number, resetTime: number) {
  const resetTimeSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({ 
      error: 'Too many attempts. Please try again later.',
      retryAfter: resetTimeSeconds
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetTimeSeconds.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString()
      }
    }
  );
} 
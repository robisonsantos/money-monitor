import { json } from '@sveltejs/kit';
import { userDb, sessionDb } from '$lib/database';
import { authRateLimiter, getClientIdentifier, createRateLimitResponse } from '$lib/rateLimit';
import { sanitizeEmail, sanitizeText, sanitizeName } from '$lib/sanitize';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const clientId = getClientIdentifier(request);
  
  // Check rate limit
  const rateLimitCheck = authRateLimiter.check(clientId);
  if (rateLimitCheck.isLimited) {
    return createRateLimitResponse(rateLimitCheck.remaining, rateLimitCheck.resetTime);
  }

  try {
    const { email, password, name } = await request.json();

    // Sanitize inputs
    const cleanEmail = sanitizeEmail(email || '');
    const cleanPassword = sanitizeText(password || '');
    const cleanName = sanitizeName(name || '');

    // Basic validation
    if (!cleanEmail || !cleanPassword) {
      authRateLimiter.record(clientId); // Record failed attempt
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Strengthened password validation
    if (cleanPassword.length < 12) {
      authRateLimiter.record(clientId); // Record failed attempt
      return json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(cleanPassword)) {
      authRateLimiter.record(clientId); // Record failed attempt
      return json({ 
        error: 'Password must contain uppercase, lowercase, number, and special character' 
      }, { status: 400 });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      authRateLimiter.record(clientId); // Record failed attempt
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await userDb.getUserByEmail(cleanEmail);
    if (existingUser) {
      authRateLimiter.record(clientId); // Record failed attempt
      return json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create user
    const user = await userDb.createUser(cleanEmail, cleanPassword, cleanName);

    // Successful registration - reset rate limit for this client
    authRateLimiter.reset(clientId);

    // Generate secure session token
    const sessionToken = sessionDb.generateSessionToken();
    
    // Set session expiration to 7 days (reduced from 30 days for security)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create session in database
    await sessionDb.createSession(user.id, sessionToken, expiresAt);
    
    // Set secure cookie
    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Enable secure flag in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days (reduced from 30 days)
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
    // Record failed attempt for any server errors
    authRateLimiter.record(clientId);
    
    // Log error for debugging but don't expose details to client
    console.error('Signup error:', error);
    return json({ error: 'Registration failed' }, { status: 500 });
  }
}; 
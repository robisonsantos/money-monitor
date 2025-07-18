import { userDb, sessionDb } from '$lib/database';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
  // Get session token from cookies
  const sessionToken = event.cookies.get('session');
  
  if (sessionToken) {
    try {
      // Validate session token in database
      const session = await sessionDb.getSession(sessionToken);
      
      if (session) {
        // Get user details
        const user = await userDb.getUserById(session.user_id);
        
        if (user) {
          event.locals.user = {
            id: user.id,
            email: user.email,
            name: user.name
          };
          
          // Extend session if it's going to expire soon (within 1 day)
          const oneDayFromNow = new Date();
          oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
          
          if (session.expires_at < oneDayFromNow) {
            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + 7);
            await sessionDb.updateSessionExpiration(sessionToken, newExpiresAt);
          }
        }
      } else {
        // Session not found or expired, clear the cookie
        event.cookies.delete('session', { path: '/' });
      }
    } catch (error) {
      // Invalid session token, clear it
      console.error('Session validation error:', error);
      event.cookies.delete('session', { path: '/' });
    }
  }
  
  const response = await resolve(event);
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add CSP header for additional XSS protection
  if (!dev) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
    );
  }
  
  return response;
}; 
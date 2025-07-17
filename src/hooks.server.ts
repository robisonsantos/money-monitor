import { userDb } from '$lib/database';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
  // Get session token from cookies
  const sessionToken = event.cookies.get('session');
  
  if (sessionToken) {
    try {
      // In a real app, you'd store sessions in a table, but for simplicity
      // we'll decode the user ID from the session token (base64 encoded)
      const userId = parseInt(Buffer.from(sessionToken, 'base64').toString());
      const user = userDb.getUserById(userId);
      
      if (user) {
        event.locals.user = {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    } catch (error) {
      // Invalid session token, clear it
      event.cookies.delete('session', { path: '/' });
    }
  }
  
  return resolve(event);
}; 
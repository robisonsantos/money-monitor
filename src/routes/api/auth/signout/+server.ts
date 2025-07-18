import { json } from '@sveltejs/kit';
import { sessionDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    // Get session token from cookies
    const sessionToken = cookies.get('session');
    
    if (sessionToken) {
      // Delete session from database
      await sessionDb.deleteSession(sessionToken);
    }
    
    // Clear the session cookie
    cookies.delete('session', { path: '/' });

    return json({ success: true });
  } catch (error) {
    // Log error for debugging but still clear cookie
    console.error('Signout error:', error);
    cookies.delete('session', { path: '/' });
    return json({ success: true }); // Always return success for signout
  }
}; 
import { json } from '@sveltejs/kit';
import { userDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate user
    const user = await userDb.authenticateUser(email, password);
    if (!user) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session (simple base64 encoded user ID)
    const sessionToken = Buffer.from(user.id.toString()).toString('base64');
    
    // Set secure cookie
    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30 // 30 days
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
    console.error('Signin error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 
import { json } from '@sveltejs/kit';
import { userDb } from '$lib/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password, name } = await request.json();

    // Basic validation
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = userDb.getUserByEmail(email);
    if (existingUser) {
      return json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create user
    const user = await userDb.createUser(email, password, name);

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
    console.error('Signup error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 
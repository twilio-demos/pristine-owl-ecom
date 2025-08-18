import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';
import { createSession } from '@/lib/session';
import { type User as DataUser } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: DataUser = {
      id: users.length + 1,
      email,
      password,
      name
    };

    users.push(newUser);

    // Create session
    const sessionId = createSession({
      user_id: newUser.id.toString(),
      email: newUser.email,
      name: newUser.name
    });

    // Set cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { id: newUser.id, email: newUser.email, name: newUser.name } 
    });

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
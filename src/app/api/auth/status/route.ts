import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookieString } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const cookieString = request.headers.get('Cookie');
    const session = getSessionFromCookieString(cookieString);

    if (!session) {
      return NextResponse.json({ isAuthenticated: false });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
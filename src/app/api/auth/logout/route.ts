import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers'; // Not needed for setting/deleting in response

export async function POST() {
  try {
    // Create a response object to modify cookies
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Clear the cookie by setting it on the response with maxAge 0
    response.cookies.set('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire the cookie immediately
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
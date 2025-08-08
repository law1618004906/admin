import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Debug endpoint',
      user: await getAuthenticatedUser(request),
    });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({
      error: 'Debug error',
      details: message,
    });
  }
}
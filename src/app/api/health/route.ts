import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Good!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
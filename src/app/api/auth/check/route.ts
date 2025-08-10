import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PERMANENT_USER_CONFIG } from '@/lib/permanent-auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin-session');
    
    if (session && (session.value.startsWith('admin-session-') || session.value.startsWith('root-admin-فقار-'))) {
      return NextResponse.json({ 
        authenticated: true, 
        user: { 
          username: PERMANENT_USER_CONFIG.username, 
          role: PERMANENT_USER_CONFIG.role, 
          permissions: PERMANENT_USER_CONFIG.permissions 
        }
      });
    } else {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

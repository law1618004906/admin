import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.user.findFirst({
      where: { email: 'admin@hamidawi.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          email: existingAdmin.email,
          name: existingAdmin.name,
        }
      });
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    const adminUser = await db.user.create({
      data: {
        email: 'admin@hamidawi.com',
        username: 'admin',
        password: hashedPassword,
        name: 'مدير النظام',
        phone: '+970000000000',
        role: 'ADMIN'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if admin user exists
    const adminUser = await db.user.findFirst({
      where: { email: 'admin@hamidawi.com' }
    });

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        message: 'Admin user not found',
        needsSetup: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'System is ready',
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Check setup error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup' },
      { status: 500 }
    );
  }
}
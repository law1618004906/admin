import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { verifyCsrf } from '@/lib/csrf';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          roleRel: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    // CSRF protection for unsafe method
    if (!verifyCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    const body = await request.json();
    const { email, username, password, name, phone, roleId } = body;

    // Validate required fields
    if (!email || !username || !password || !name || !roleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Ensure role exists
    const role = await db.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Hash password
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(password);

    // Create user
    const created = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        phone,
        roleId,
        isActive: true,
      },
      include: { roleRel: true },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: created.id,
        oldValues: null,
        newValues: JSON.stringify({
          email: created.email,
          name: created.name,
          roleId: created.roleId,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      data: created,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
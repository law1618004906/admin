import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { getUserById, updateUser, deleteUser } from '@/lib/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
});

interface RouteContext {
  params: {
    id: string;
  };
}

// GET single user
export async function GET(request: NextRequest, { params }: RouteContext) {
  return requireAuth(async (req, authUser) => {
    if (authUser.role !== 'ADMIN' && authUser.id !== params.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const user = await getUserById(params.id);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { password, ...userWithoutPassword } = user;
      return NextResponse.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(request);
}

// PUT update user
export async function PUT(request: NextRequest, { params }: RouteContext) {
  return requireAuth(async (req, authUser) => {
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = params;
      const body = await request.json();
      const validatedData = updateUserSchema.parse(body);

      const currentUser = await getUserById(id);
      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (validatedData.email || validatedData.username) {
        const orConditions: Prisma.UserWhereInput[] = [];
        if (validatedData.email) orConditions.push({ email: validatedData.email });
        if (validatedData.username) orConditions.push({ username: validatedData.username });

        const existingUser = await db.user.findFirst({
          where: {
            OR: orConditions,
            NOT: { id },
          },
        });

        if (existingUser) {
          return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 });
        }
      }

      const updatedUser = await updateUser(id, validatedData);

      await db.activityLog.create({
        data: {
          userId: authUser.id,
          action: 'UPDATE_USER',
          entityType: 'User',
          entityId: id,
          oldValues: JSON.stringify(currentUser),
          newValues: JSON.stringify(updatedUser),
        },
      });
      
      const { password, ...userWithoutPassword } = updatedUser;
      return NextResponse.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(request);
}

// DELETE user
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return requireAuth(async (req, authUser) => {
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = params;

      if (id === authUser.id) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
      }

      const existingUser = await getUserById(id);
      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await deleteUser(id);

      await db.activityLog.create({
        data: {
          userId: authUser.id,
          action: 'DELETE_USER',
          entityType: 'User',
          entityId: id,
          oldValues: JSON.stringify(existingUser),
        },
      });

      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(request);
}

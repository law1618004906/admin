import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

// Helper to normalize permissions input (array or comma-separated string) -> array<string>
const permissionsInput = z
  .union([z.array(z.string()), z.string()])
  .transform((val) => {
    const arr = Array.isArray(val)
      ? val
      : val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    // dedupe and keep non-empty
    return Array.from(new Set(arr));
  });

const createRoleSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().min(2),
  description: z.string().optional(),
  permissions: permissionsInput,
});

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: permissionsInput.optional(),
  isActive: z.boolean().optional(),
});

// GET all roles
export async function GET(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('roles.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const roles = await db.role.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      const parsed = roles.map((r) => {
        let perms: string[] = [];
        const raw = r.permissions ?? '';
        if (raw) {
          try {
            // Try JSON array first
            const maybe = JSON.parse(raw);
            if (Array.isArray(maybe)) perms = maybe.filter((x) => typeof x === 'string');
          } catch {
            // Fallback CSV
            perms = raw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }
        return {
          ...r,
          permissions: perms,
        };
      });

      return NextResponse.json({
        success: true,
        data: { roles: parsed },
      });
    } catch (error) {
      console.error('Get roles error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// POST create new role
export async function POST(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('roles.create')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = createRoleSchema.parse(body);

      // Check if role name already exists
      const existingRole = await db.role.findFirst({
        where: {
          OR: [
            { name: validatedData.name },
            { nameAr: validatedData.nameAr },
          ],
        },
      });

      if (existingRole) {
        return NextResponse.json(
          { error: 'Role with this name already exists' },
          { status: 400 }
        );
      }

      const newRole = await db.role.create({
        data: {
          name: validatedData.name,
          nameAr: validatedData.nameAr,
          // description/isActive are not fields in Role model; ignore safely
          permissions: JSON.stringify(validatedData.permissions),
        },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_ROLE',
          entityType: 'Role',
          entityId: newRole.id,
          newValues: JSON.stringify({
            name: newRole.name,
            nameAr: newRole.nameAr,
            permissions: validatedData.permissions,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...newRole,
          permissions: validatedData.permissions,
        },
      });
    } catch (error) {
      console.error('Create role error:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

// Normalize permissions input (array or comma-separated string) -> array<string>
const permissionsInput = z
  .union([z.array(z.string()), z.string()])
  .transform((val) => {
    const arr = Array.isArray(val)
      ? val
      : val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    return Array.from(new Set(arr));
  });

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: permissionsInput.optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET single role
export async function GET(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('roles.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;
      
      const role = await db.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      });

      if (!role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      // Parse permissions for the response (JSON array or CSV fallback)
      let parsedPermissions: string[] = [];
      const raw = role.permissions ?? '';
      if (raw) {
        try {
          const maybe = JSON.parse(raw);
          if (Array.isArray(maybe)) parsedPermissions = maybe.filter((x) => typeof x === 'string');
        } catch {
          parsedPermissions = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...role,
          permissions: parsedPermissions,
        },
      });
    } catch (error) {
      console.error('Get role error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT update role
export async function PUT(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('roles.update')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;
      const body = await request.json();
      const validatedData = updateRoleSchema.parse(body);

      // Get current role for comparison
      const currentRole = await db.role.findUnique({
        where: { id },
      });

      if (!currentRole) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      // Check for name conflicts
      if (validatedData.name || validatedData.nameAr) {
        const existingRole = await db.role.findFirst({
          where: {
            OR: [
              ...(validatedData.name ? [{ name: validatedData.name }] : []),
              ...(validatedData.nameAr ? [{ nameAr: validatedData.nameAr }] : []),
            ],
            NOT: { id },
          },
        });

        if (existingRole) {
          return NextResponse.json(
            { error: 'Role with this name already exists' },
            { status: 400 }
          );
        }
      }

      const updateData: any = { ...validatedData };
      // Convert permissions array to JSON string if provided
      if (validatedData.permissions) {
        updateData.permissions = JSON.stringify(validatedData.permissions);
      }

      const updatedRole = await db.role.update({
        where: { id },
        data: updateData,
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE_ROLE',
          entityType: 'Role',
          entityId: id,
          oldValues: JSON.stringify({
            name: currentRole.name,
            nameAr: currentRole.nameAr,
            permissions: currentRole.permissions,
          }),
          newValues: JSON.stringify({
            name: updatedRole.name,
            nameAr: updatedRole.nameAr,
            permissions: updatedRole.permissions,
          }),
        },
      });

      // Build response with permissions as array
      let outPermissions: string[] | undefined = validatedData.permissions;
      if (!outPermissions) {
        const raw = updatedRole.permissions ?? '';
        if (raw) {
          try {
            const maybe = JSON.parse(raw);
            if (Array.isArray(maybe)) outPermissions = maybe.filter((x) => typeof x === 'string');
          } catch {
            outPermissions = raw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } else {
          outPermissions = [];
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...updatedRole,
          permissions: outPermissions,
        },
      });
    } catch (error) {
      console.error('Update role error:', error);
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

// DELETE role
export async function DELETE(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('roles.delete')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;

      // Check if role has users
      const usersCount = await db.user.count({
        where: { roleId: id },
      });

      if (usersCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete role that has assigned users' },
          { status: 400 }
        );
      }

      const existingRole = await db.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }

      await db.role.delete({
        where: { id },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'DELETE_ROLE',
          entityType: 'Role',
          entityId: id,
          oldValues: JSON.stringify({
            name: existingRole.name,
            nameAr: existingRole.nameAr,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      console.error('Delete role error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
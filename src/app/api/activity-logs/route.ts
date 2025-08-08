import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

// GET all activity logs
export async function GET(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('users.read')) { // Using users.read as base permission for logs
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const action = searchParams.get('action');
      const entityType = searchParams.get('entityType');
      const userId = searchParams.get('userId');
      const exportFormat = searchParams.get('export'); // 'csv'

      const skip = (page - 1) * limit;

      const where: any = {};
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (userId) where.userId = userId;

      if (exportFormat === 'csv') {
        // Export all logs as CSV
        const logs = await db.activityLog.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Convert to CSV
        const csvHeaders = [
          'Timestamp',
          'User',
          'Email',
          'Action',
          'Entity Type',
          'Entity ID',
          'IP Address',
          'User Agent',
        ];

        const csvRows = logs.map(log => [
          log.createdAt,
          log.user?.name || '',
          log.user?.email || '',
          log.action,
          log.entityType,
          log.entityId,
          log.ipAddress || '',
          log.userAgent || '',
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      const [logs, total] = await Promise.all([
        db.activityLog.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        db.activityLog.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// POST create activity log (for manual logging)
export async function POST(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('users.create')) { // Using create permission as base for manual logging
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { action, entityType, entityId, oldValues, newValues } = body;

      if (!action || !entityType) {
        return NextResponse.json(
          { error: 'Action and entityType are required' },
          { status: 400 }
        );
      }

      // Get client IP and user agent
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const activityLog = await db.activityLog.create({
        data: {
          userId: user.id,
          action,
          entityType,
          entityId,
          oldValues: oldValues ? JSON.stringify(oldValues) : null,
          newValues: newValues ? JSON.stringify(newValues) : null,
          ipAddress: clientIP,
          userAgent,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: activityLog,
      });
    } catch (error) {
      console.error('Create activity log error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
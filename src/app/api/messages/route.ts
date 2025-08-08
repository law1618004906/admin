import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

const createMessageSchema = z.object({
  title: z.string().min(2),
  titleAr: z.string().min(2),
  content: z.string().min(10),
  contentAr: z.string().min(10),
  type: z.literal('MANAGER_TO_LEADERS'),
  recipients: z.array(z.string()),
});

const updateMessageSchema = z.object({
  title: z.string().min(2).optional(),
  titleAr: z.string().min(2).optional(),
  content: z.string().min(10).optional(),
  contentAr: z.string().min(10).optional(),
  type: z.literal('MANAGER_TO_LEADERS').optional(),
  recipients: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'SENT', 'DELIVERED', 'READ']).optional(),
});

// GET all messages
export async function GET(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('messages.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');

      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      
      // Only show messages of type MANAGER_TO_LEADERS
      where.type = 'MANAGER_TO_LEADERS';

      const [messages, total] = await Promise.all([
        db.message.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        db.message.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          messages,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get messages error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// POST create new message
export async function POST(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('messages.create')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = createMessageSchema.parse(body);

      // Verify user is a manager
      if (user.role.name !== 'MANAGER') {
        return NextResponse.json(
          { error: 'Only managers can send messages to leaders' },
          { status: 403 }
        );
      }

      // Validate that recipients are leaders
      if (validatedData.recipients.length > 0) {
        const leaders = await db.leader.findMany({
          where: {
            id: {
              in: validatedData.recipients,
            },
          },
        });

        if (leaders.length !== validatedData.recipients.length) {
          return NextResponse.json(
            { error: 'Invalid leader IDs in recipients' },
            { status: 400 }
          );
        }
      }

      const messageData: any = {
        ...validatedData,
        senderId: user.id,
        recipients: JSON.stringify(validatedData.recipients),
        status: 'SENT', // Auto-send messages
        sentAt: new Date(),
      };

      const newMessage = await db.message.create({
        data: messageData,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_MESSAGE',
          entityType: 'Message',
          entityId: newMessage.id,
          newValues: JSON.stringify({
            title: newMessage.title,
            type: newMessage.type,
            recipientCount: validatedData.recipients.length,
            status: newMessage.status,
          }),
        },
      });

      // Create notifications for leaders
      if (validatedData.recipients.length > 0) {
        const notifications = validatedData.recipients.map((leaderId) => ({
          title: 'رسالة جديدة من المدير',
          titleAr: 'رسالة جديدة من المدير',
          message: `تم إرسال رسالة جديدة بعنوان: ${validatedData.titleAr}`,
          messageAr: `تم إرسال رسالة جديدة بعنوان: ${validatedData.titleAr}`,
          type: 'SYSTEM_UPDATE',
          userId: leaderId,
        }));

        await db.notification.createMany({
          data: notifications,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Message sent to leaders successfully',
        data: {
          ...newMessage,
          recipients: validatedData.recipients,
        },
      });
    } catch (error) {
      console.error('Create message error:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
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
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateMessageSchema = z.object({
  title: z.string().min(2).optional(),
  titleAr: z.string().min(2).optional(),
  content: z.string().min(10).optional(),
  contentAr: z.string().min(10).optional(),
  type: z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'PUSH_NOTIFICATION']).optional(),
  recipients: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'SENT', 'DELIVERED', 'FAILED']).optional(),
});

// GET single message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('messages.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const message = await db.message.findUnique({
        where: { id: params.id },
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

      if (!message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      // Parse recipients JSON
      let recipients = [];
      try {
        recipients = JSON.parse(message.recipients);
      } catch {
        // If JSON parsing fails, try to split by comma
        if (typeof message.recipients === 'string') {
          recipients = message.recipients.split(',').filter(Boolean);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...message,
          recipients,
        },
      });
    } catch (error) {
      console.error('Get message error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT update message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('messages.update')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = updateMessageSchema.parse(body);

      // Check if message exists
      const existingMessage = await db.message.findUnique({
        where: { id: params.id },
      });

      if (!existingMessage) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      const updateData: any = { ...validatedData };

      // Handle recipients
      if (validatedData.recipients) {
        updateData.recipients = JSON.stringify(validatedData.recipients);
      }

      // Handle scheduled date
      if (validatedData.scheduledAt) {
        updateData.scheduledAt = new Date(validatedData.scheduledAt);
      }

      const updatedMessage = await db.message.update({
        where: { id: params.id },
        data: updateData,
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
          action: 'UPDATE_MESSAGE',
          entityType: 'Message',
          entityId: updatedMessage.id,
          oldValues: JSON.stringify({
            title: existingMessage.title,
            status: existingMessage.status,
          }),
          newValues: JSON.stringify({
            title: updatedMessage.title,
            status: updatedMessage.status,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedMessage,
          recipients: validatedData.recipients || JSON.parse(updatedMessage.recipients),
        },
      });
    } catch (error) {
      console.error('Update message error:', error);
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

// DELETE message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('messages.delete')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const existingMessage = await db.message.findUnique({
        where: { id: params.id },
      });

      if (!existingMessage) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      await db.message.delete({
        where: { id: params.id },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'DELETE_MESSAGE',
          entityType: 'Message',
          entityId: params.id,
          oldValues: JSON.stringify({
            title: existingMessage.title,
            type: existingMessage.type,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Delete message error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
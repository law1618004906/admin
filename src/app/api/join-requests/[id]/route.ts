import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateJoinRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET single join request
export async function GET(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('join_requests.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;
      
      const joinRequest = await db.joinRequest.findUnique({
        where: { id },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!joinRequest) {
        return NextResponse.json(
          { error: 'Join request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: joinRequest,
      });
    } catch (error) {
      console.error('Get join request error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT update join request
export async function PUT(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('join_requests.update')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;
      const body = await request.json();
      const validatedData = updateJoinRequestSchema.parse(body);

      // Get current join request for comparison
      const currentRequest = await db.joinRequest.findUnique({
        where: { id },
        include: {
          campaign: true,
        },
      });

      if (!currentRequest) {
        return NextResponse.json(
          { error: 'Join request not found' },
          { status: 404 }
        );
      }

      const updatedRequest = await db.joinRequest.update({
        where: { id },
        data: {
          ...validatedData,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          user: {
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
          action: 'UPDATE_JOIN_REQUEST',
          entityType: 'JoinRequest',
          entityId: id,
          oldValues: JSON.stringify({
            status: currentRequest.status,
          }),
          newValues: JSON.stringify({
            status: validatedData.status,
          }),
        },
      });

      // Create notification for the applicant if they have a user account
      if (currentRequest.userId) {
        await db.notification.create({
          data: {
            title: 'Join Request Updated',
            titleAr: 'تم تحديث طلب الانضمام',
            message: `Your join request for ${currentRequest.campaign.titleAr} has been ${validatedData.status.toLowerCase()}`,
            messageAr: `تم ${validatedData.status === 'APPROVED' ? 'قبول' : 'رفض'} طلب انضمامك لحملة ${currentRequest.campaign.titleAr}`,
            type: validatedData.status === 'APPROVED' ? 'SUCCESS' : 'INFO',
            userId: currentRequest.userId,
            metadata: JSON.stringify({
              joinRequestId: id,
              status: validatedData.status,
              campaignId: currentRequest.campaignId,
            }),
          },
        });
      }

      // If approved, create a user account if one doesn't exist
      if (validatedData.status === 'APPROVED' && !currentRequest.userId) {
        const { createUser } = await import('@/lib/auth');
        const { hashPassword } = await import('@/lib/auth');
        
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await hashPassword(tempPassword);

        try {
          const newUser = await createUser({
            email: currentRequest.email,
            username: currentRequest.email.split('@')[0] + '_' + Date.now(),
            password: tempPassword,
            name: currentRequest.name,
            phone: currentRequest.phone,
            roleId: 'assistant-role', // Default role for approved volunteers
          });

          // Update join request with user ID
          await db.joinRequest.update({
            where: { id },
            data: { userId: newUser.id },
          });

          // Create welcome notification
          await db.notification.create({
            data: {
              title: 'Welcome to the Campaign',
              titleAr: 'مرحباً بك في الحملة',
              message: `Your account has been created. Your temporary password is: ${tempPassword}`,
              messageAr: `تم إنشاء حسابك. كلمة المرور المؤقتة هي: ${tempPassword}`,
              type: 'SUCCESS',
              userId: newUser.id,
              metadata: JSON.stringify({
                joinRequestId: id,
                tempPassword,
              }),
            },
          });
        } catch (error) {
          console.error('Error creating user for approved request:', error);
        }
      }

      return NextResponse.json({
        success: true,
        data: updatedRequest,
      });
    } catch (error) {
      console.error('Update join request error:', error);
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

// DELETE join request
export async function DELETE(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('join_requests.delete')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;

      const existingRequest = await db.joinRequest.findUnique({
        where: { id },
      });

      if (!existingRequest) {
        return NextResponse.json(
          { error: 'Join request not found' },
          { status: 404 }
        );
      }

      await db.joinRequest.delete({
        where: { id },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'DELETE_JOIN_REQUEST',
          entityType: 'JoinRequest',
          entityId: id,
          oldValues: JSON.stringify({
            name: existingRequest.name,
            email: existingRequest.email,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Join request deleted successfully',
      });
    } catch (error) {
      console.error('Delete join request error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
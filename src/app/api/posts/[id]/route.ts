import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

const updatePostSchema = z.object({
  title: z.string().min(2).optional(),
  titleAr: z.string().min(2).optional(),
  content: z.string().optional(),
  contentAr: z.string().optional(),
  type: z.enum(['ANNOUNCEMENT', 'NEWS', 'EVENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA', 'INTERNAL']).optional(),
  campaignId: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET single post
export async function GET(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('posts.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;
      
      const post = await db.post.findUnique({
        where: { id },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          interactions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              interactions: true,
            },
          },
        },
      });

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: post,
      });
    } catch (error) {
      console.error('Get post error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT update post
export async function PUT(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('posts.update')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;
      const body = await request.json();
      const validatedData = updatePostSchema.parse(body);

      // Get current post for comparison
      const currentPost = await db.post.findUnique({
        where: { id },
      });

      if (!currentPost) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      // Validate campaign if provided
      if (validatedData.campaignId) {
        const campaign = await db.campaign.findUnique({
          where: { id: validatedData.campaignId },
        });

        if (!campaign) {
          return NextResponse.json(
            { error: 'Invalid campaign' },
            { status: 400 }
          );
        }
      }

      const updateData: any = { ...validatedData };
      
      // Convert scheduledAt string to Date if provided
      if (validatedData.scheduledAt) {
        updateData.scheduledAt = new Date(validatedData.scheduledAt);
      }

      // Handle status changes
      if (validatedData.status === 'PUBLISHED' && currentPost.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      } else if (validatedData.status === 'ARCHIVED' && currentPost.status !== 'ARCHIVED') {
        updateData.archivedAt = new Date();
      }

      const updatedPost = await db.post.update({
        where: { id },
        data: updateData,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
          author: {
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
          action: 'UPDATE_POST',
          entityType: 'Post',
          entityId: id,
          oldValues: JSON.stringify({
            title: currentPost.title,
            status: currentPost.status,
            type: currentPost.type,
          }),
          newValues: JSON.stringify({
            title: updatedPost.title,
            status: updatedPost.status,
            type: updatedPost.type,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      console.error('Update post error:', error);
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

// DELETE post
export async function DELETE(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('posts.delete')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;

      const existingPost = await db.post.findUnique({
        where: { id },
      });

      if (!existingPost) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      await db.post.delete({
        where: { id },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'DELETE_POST',
          entityType: 'Post',
          entityId: id,
          oldValues: JSON.stringify({
            title: existingPost.title,
            campaignId: existingPost.campaignId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Delete post error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// POST publish post
export async function POST(request: NextRequest, context: RouteParams) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('posts.update')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { id } = context.params;

      const existingPost = await db.post.findUnique({
        where: { id },
      });

      if (!existingPost) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      if (existingPost.status === 'PUBLISHED') {
        return NextResponse.json(
          { error: 'Post is already published' },
          { status: 400 }
        );
      }

      const updatedPost = await db.post.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
          author: {
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
          action: 'PUBLISH_POST',
          entityType: 'Post',
          entityId: id,
          oldValues: JSON.stringify({
            status: existingPost.status,
          }),
          newValues: JSON.stringify({
            status: 'PUBLISHED',
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      console.error('Publish post error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
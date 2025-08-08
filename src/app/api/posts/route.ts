import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(2),
  titleAr: z.string().min(2),
  content: z.string().optional(),
  contentAr: z.string().optional(),
  type: z.enum(['ANNOUNCEMENT', 'NEWS', 'EVENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA', 'INTERNAL']),
  campaignId: z.string(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  scheduledAt: z.string().optional(),
});

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

// GET all posts
export async function GET(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('posts.read')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const type = searchParams.get('type');
      const campaignId = searchParams.get('campaignId');
      const authorId = searchParams.get('authorId');

      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (status) where.status = status;
      if (type) where.type = type;
      if (campaignId) where.campaignId = campaignId;
      if (authorId) where.authorId = authorId;

      const [posts, total] = await Promise.all([
        db.post.findMany({
          where,
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
            _count: {
              select: {
                interactions: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: [
            { scheduledAt: 'desc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        db.post.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get posts error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// POST create new post
export async function POST(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('posts.create')(request, user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = createPostSchema.parse(body);

      // Validate campaign exists
      const campaign = await db.campaign.findUnique({
        where: { id: validatedData.campaignId },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Invalid campaign' },
          { status: 400 }
        );
      }

      const postData: any = {
        ...validatedData,
        authorId: user.id,
        status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      };

      // Handle scheduled posts
      if (validatedData.scheduledAt) {
        postData.scheduledAt = new Date(validatedData.scheduledAt);
      }

      const newPost = await db.post.create({
        data: postData,
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
          action: 'CREATE_POST',
          entityType: 'Post',
          entityId: newPost.id,
          newValues: JSON.stringify({
            title: newPost.title,
            campaignId: newPost.campaignId,
            type: newPost.type,
            status: newPost.status,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: newPost,
      });
    } catch (error) {
      console.error('Create post error:', error);
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
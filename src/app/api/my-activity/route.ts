import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user activity logs
    const activityLogs = await db.activityLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Get user notifications
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Get user's tasks if any
    const tasks = await db.task.findMany({
      where: {
        assignedTo: session.user.id
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            titleAr: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get user's post interactions
    const postInteractions = await db.postInteraction.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            type: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 30
    });

    return NextResponse.json({
      success: true,
      data: {
        activityLogs,
        notifications,
        tasks,
        postInteractions,
        stats: {
          totalActivities: activityLogs.length,
          unreadNotifications: notifications.filter(n => !n.isRead).length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
          totalInteractions: postInteractions.length,
          likesCount: postInteractions.filter(pi => pi.type === 'LIKE').length,
          commentsCount: postInteractions.filter(pi => pi.type === 'COMMENT').length,
          sharesCount: postInteractions.filter(pi => pi.type === 'SHARE').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
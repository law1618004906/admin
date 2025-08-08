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

    // Check if user is LEADER
    if (session.user.role !== 'LEADER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the leader profile for this user
    const leader = await db.leader.findFirst({
      where: {
        userId: session.user.id
      }
    });

    if (!leader) {
      return NextResponse.json({ error: 'Leader profile not found' }, { status: 404 });
    }

    // Get tasks assigned to this leader
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
        },
        area: {
          select: {
            id: true,
            name: true,
            nameAr: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get notifications for this leader
    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Get messages sent to this leader
    const messages = await db.message.findMany({
      where: {
        recipients: {
          contains: leader.id
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get activity logs for this leader
    const activityLogs = await db.activityLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 30
    });

    return NextResponse.json({
      success: true,
      data: {
        leader: {
          id: leader.id,
          name: leader.full_name
        },
        tasks,
        notifications,
        messages,
        activityLogs,
        stats: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
          pendingTasks: tasks.filter(t => t.status === 'PENDING').length,
          unreadNotifications: notifications.filter(n => !n.isRead).length,
          unreadMessages: messages.filter(m => m.status === 'SENT').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching leader activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
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

    // For now, we'll get all individuals since we don't have user-leader mapping
    // In a real implementation, you would get the leader profile for this user
    const individuals = await db.individual.findMany({
      include: {
        leader: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        full_name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        individuals: individuals,
        individualsCount: individuals.length,
        totalVotes: individuals.reduce((sum, individual) => sum + individual.votes_count, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching individuals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
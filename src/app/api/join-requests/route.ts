import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createJoinRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  position: z.string().optional(),
  experience: z.string().optional(),
  message: z.string().optional(),
  campaignId: z.string(),
});

const updateJoinRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

// Temporarily disabled until Prisma models (JoinRequest/Campaign/Notification) are added
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Join Requests API not implemented yet' },
    { status: 501 }
  );
}

// POST create new join request (public endpoint)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Join Requests API not implemented yet' },
    { status: 501 }
  );
}
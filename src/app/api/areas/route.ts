import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';
import { db } from '@/lib/db';

// GET all areas
export async function GET(request: NextRequest) {
  return requireAuth(async (request, user) => {
    if (!requirePermission('areas.read')(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const campaignId = searchParams.get('campaignId');

      const where: any = {};
      if (campaignId) where.campaignId = campaignId;

      // إذا لم يكن db.area موجوداً، فهذا يعني أن Prisma Client لم يتم تحديثه بعد إضافة موديل Area
      // تأكد من أن prisma/schema.prisma يحتوي على model Area
      // ثم شغّل: npx prisma generate
      // بعد ذلك استخدم db.area.findMany
            const areas = await db.area.findMany({
        where,
        // إذا كان لديك علاقة campaign أو _count في موديل Area، أضفها هنا، وإلا احذفها
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: { areas },
      });
    } catch (error) {
      console.error('Get areas error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
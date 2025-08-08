import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/middleware';

// GET all campaigns (بديل مؤقت لإزالة 500)
export async function GET(request: NextRequest) {
  return requireAuth(async (_req, user) => {
    // إصلاح التوقيع: استدعِ الدالة المُعادة مع المستخدم فقط
    const canReadCampaigns = requirePermission('campaigns.read')(user);
    if (!canReadCampaigns) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    try {
      // لا يوجد جدول حملات في المخطط الحالي، نعيد قائمة فارغة مؤقتاً
      const campaigns: any[] = [];

      return NextResponse.json({
        success: true,
        data: { campaigns },
      });
    } catch (error) {
      console.error('Get campaigns error (fallback):', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { db } from '@/lib/db';

// بنية العقدة الشجرية
type TreeNode = {
  id: string;         // نجعلها string للتوحيد مع الواجهة
  label: string;
  type: 'leader' | 'person';
  votes?: number;
  children?: TreeNode[];
};

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    await requireAuth(request);
    
    // اجلب جميع القادة
      const leaders = await db.$queryRawUnsafe<Array<{
        id: number;
        full_name: string;
        votes_count: number;
      }>>(
        `
        SELECT id, full_name, votes_count
        FROM leaders
        ORDER BY id DESC
        `
      );

      // لكل قائد اجلب الأفراد المرتبطين باسمه
      const tree: TreeNode[] = [];
      for (const l of leaders) {
        const persons = await db.$queryRawUnsafe<Array<{
          id: number;
          full_name: string;
          votes_count: number;
        }>>(
          `
          SELECT id, full_name, votes_count
          FROM persons
          WHERE leader_name = ?
          ORDER BY id DESC
          `,
          l.full_name
        );

        const children: TreeNode[] = persons.map(p => ({
          id: String(p.id),
          label: p.full_name,
          type: 'person',
          votes: p.votes_count ?? 0,
        }));

        tree.push({
          id: String(l.id),
          label: l.full_name,
          type: 'leader',
          votes: l.votes_count ?? 0,
          children,
        });
      }

      return NextResponse.json({
        success: true,
        data: tree,
      });
    } catch (error) {
      console.error('Error fetching leaders tree:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  })(request);
}

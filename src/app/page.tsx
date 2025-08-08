'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, Crown, Menu as MenuIcon, X } from 'lucide-react';
import { logout } from '@/lib/logout';
import LeaderPieChart from '@/components/LeaderPieChart';

// نوع إحصائيات اللوحة
type DashboardStats = {
  totalLeaders: number;
  totalPersons: number;
  totalVotes: number;
  leadersDistribution?: { leaderId: number | null; leaderName: string; count: number }[];
};

type AggregatesNormalized = {
  leader_name: string;
  cnt: number;
  sum_votes: number;
};

type PersonPreview = {
  id: number;
  leader_name: string;
  full_name: string;
  residence: string;
  phone: string;
  workplace: string;
  center_info: string;
  station_number: string;
  votes_count: number;
};

type LeaderWithPreview = {
  id: number;
  full_name: string;
  individualsPreview?: PersonPreview[];
};

type LeadersResp = {
  aggregatesNormalized?: AggregatesNormalized[];
  leaders?: LeaderWithPreview[];
};

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // حالة الرسم
  const [chartLoading, setChartLoading] = useState(true);
  const [chartErr, setChartErr] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; __percent?: number }[]>([]);

  // لا حاجة لهيدرز Authorization في الإنتاج؛ نعتمد على كوكي HttpOnly فقط

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setChartLoading(true);
    fetch('/api/dashboard/stats', { cache: 'no-store', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DashboardStats;
        if (!mounted) return;
        setStats({
          totalLeaders: json.totalLeaders,
          totalPersons: json.totalPersons,
          totalVotes: json.totalVotes,
          leadersDistribution: json.leadersDistribution,
        } as any);

        // اعداد بيانات الرسم من leadersDistribution
        const dist = Array.isArray(json.leadersDistribution) ? json.leadersDistribution! : [];
        let rows = dist.map(d => ({
          name: d.leaderName || 'غير معلوم',
          value: Number(d.count || 0),
        }));
        // في حال لا توجد بيانات، اجعل صفاً افتراضياً
        if (!rows.length) rows = [{ name: 'غير معلوم', value: 0 }];

        const total = rows.reduce((s, r) => s + (r.value || 0), 0);
        const withPercent = rows.map(r => ({ ...r, __percent: total > 0 ? (r.value / total) * 100 : 0 }));
        setChartData(withPercent);
        setChartErr(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e?.message || 'فشل الجلب');
        setChartErr(e?.message || 'فشل جلب بيانات الرسم');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
        setChartLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
     <main className="p-4 md:p-6">
      {/* شريط علوي بسيط داخل الصفحة: يسار (رجوع مُلغى/مخفي) + يمين (زر القائمة) */}
      <div className="mb-4 flex items-center justify-between">
        {/* يسار: زر الرجوع منقول لليسار لكنه مُلغى (مخفي) */}
        <div className="invisible">
          <Button variant="ghost" size="sm">رجوع</Button>
        </div>
        {/* يمين: زر فتح القائمة الجانبية */}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-4 w-4" />
            القائمة
          </Button>
          <Button variant="destructive" size="sm" onClick={() => logout(window.location.pathname)}>
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* طبقة التعتيم */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* الشريط الجانبي المنزلق من اليمين */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[320px] sm:w-[360px] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-right">
            <div className="text-sm font-semibold">التنقل</div>
            <div className="text-xs opacity-70">اختر إحدى الوجهات التالية</div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 space-y-3 text-right">
          <Link href="/" onClick={() => setSidebarOpen(false)} className="block">
            <Button className="w-full justify-between bg-red-600 hover:bg-red-700">
              <span>الصفحة الرئيسية</span>
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/leaders" onClick={() => setSidebarOpen(false)} className="block">
            <Button className="w-full justify-between bg-purple-600 hover:bg-purple-700">
              <span>إدارة القادة</span>
              <Crown className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/individuals" onClick={() => setSidebarOpen(false)} className="block">
            <Button className="w-full justify-between bg-emerald-600 hover:bg-emerald-700">
              <span>إدارة الأفراد</span>
              <Users className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </aside>

      {/* صندوق صف Grain الحالة: إجمالي القادة/الأفراد/الأصوات */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-3">حالة الحملة</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="h-16 rounded bg-white/10 animate-pulse" />
            <div className="h-16 rounded bg-white/10 animate-pulse" />
            <div className="h-16 rounded bg-white/10 animate-pulse" />
          </div>
        ) : err ? (
          <div className="text-red-300 text-sm">تعذر جلب الإحصائيات: {err}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm opacity-70">إجمالي القادة</div>
              <div className="text-2xl font-bold mt-1">{stats?.totalLeaders ?? 0}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm opacity-70">إجمالي الأفراد</div>
              <div className="text-2xl font-bold mt-1">{stats?.totalPersons ?? 0}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm opacity-70">إجمالي الأصوات</div>
              <div className="text-2xl font-bold mt-1">{stats?.totalVotes ?? 0}</div>
            </div>
          </div>
        )}
      </section>

      {/* بطاقات الوصول السريع كما كانت */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* بطاقة القادة مع فحص مصادقة قبل الانتقال */}
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
              if (res.ok) {
                window.location.href = '/leaders';
              } else {
                window.location.href = '/login?returnTo=%2Fleaders';
              }
            } catch {
              window.location.href = '/login?returnTo=%2Fleaders';
            }
          }}
          className="text-right rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition block"
        >
          <div className="text-base md:text-lg font-semibold mb-1">عرض القادة</div>
          <div className="text-sm opacity-80">انتقل إلى صفحة إدارة القادة والاطّلاع على التفاصيل.</div>
        </button>

        {/* بطاقة الأفراد مع فحص مصادقة قبل الانتقال */}
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
              if (res.ok) {
                window.location.href = '/individuals';
              } else {
                window.location.href = '/login?returnTo=%2Findividuals';
              }
            } catch {
              window.location.href = '/login?returnTo=%2Findividuals';
            }
          }}
          className="text-right rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition block"
        >
          <div className="text-base md:text-lg font-semibold mb-1">عرض الأفراد</div>
          <div className="text-sm opacity-80">انتقل إلى صفحة إدارة الأفراد، التصفية، والتحرير.</div>
        </button>
      </section>

      {/* الرسم البياني أسفل الأقسام الحالية */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold">التوزيع الدائري للأفراد حسب القادة</h3>
          <span className="text-xs opacity-70">فاعلي • انقر على شريحة لعرض التفاصيل</span>
        </div>

        {chartLoading ? (
          <div className="min-h-[260px] flex items-center justify-center">
            <div className="h-40 w-40 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
          </div>
        ) : chartErr ? (
          <div className="text-red-300 text-sm">تعذر جلب بيانات الرسم: {chartErr}</div>
        ) : (
          <>
            <LeaderPieChart
              data={chartData}
              onClick={() => {
                window.location.href = '/leaders';
              }}
            />

            {/* Placeholder عند كون جميع القيم صفرية */}
            {(chartData.length > 0 && chartData.every((d) => (d.value || 0) === 0)) && (
              <div className="mt-3 text-xs opacity-80">
                تمت القراءة بنجاح لكن كل القيم 0 حالياً. أضف أفراداً ليظهر توزيع واضح.
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

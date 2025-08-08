'use client';

import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  MapPin,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Trash2,
  Pencil,
  Save,
  X,
  Home,
  ShieldAlert
} from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
// استيراد النوع الصحيح من الحزمة الأساسية
import type { InfiniteData } from '@tanstack/query-core';
import { usePermissions } from '@/hooks/use-permissions';

interface Individual {
  id: string;
  full_name: string;
  residence: string;
  phone: string;
  workplace: string;
  center_info: string;
  station_number: string;
  votes_count: number;
  status: string;
  leader?: {
    id: string;
    full_name: string;
  };
  // إضافة حقل اسم القائد النصي لدعم الإرسال
  leader_name?: string;
}

// أنواع للفرز
type SortBy = 'id' | 'votes_count';
type SortDir = 'asc' | 'desc';

// أنواع قادة للاقتراح
type LeaderOption = { id: string | number; full_name: string };

// Helpers للعرض الافتراضي
const showText = (v: any) => {
  const s = (v ?? '').toString().trim();
  return s.length ? s : 'لايوجد';
};

// Debounce helper بسيط
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// إبراز النص المطابق للبحث داخل البطاقات
function highlight(text: string | number | null | undefined, q: string | undefined): React.ReactNode {
  const value = (text ?? '').toString();
  if (!q || !q.trim()) return value;
  try {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const parts = value.split(regex);
    const matches = value.match(regex);
    if (!matches) return value;
    const out: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      out.push(parts[i]);
      if (i < parts.length - 1) {
        const m = matches[i];
        out.push(
          <mark
            key={`hl-${i}-${m}-${parts[i].length}`}
            style={{
              background: '#fff3b0',
              borderRadius: 4,
              padding: '0 2px'
            }}
          >
            {m}
          </mark>
        );
      }
    }
    return <>{out}</>;
  } catch {
    return value;
  }
}
// مكوّن سكيليتون بسيط لمرحلة التحميل الأولي
function SkeletonGrid({ rows = 3, cols = 3 }: { rows?: number; cols?: number }) {
  const items = Array.from({ length: rows * cols });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            height: 170,
            borderRadius: 8,
            border: '1px solid #eee',
            background:
              'linear-gradient(90deg, rgba(240,240,240,0.6) 25%, rgba(230,230,230,0.6) 37%, rgba(240,240,240,0.6) 63%)',
            backgroundSize: '400% 100%',
            animation: 'shimmer 1.4s ease infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  );
}

// Déclaration type RowItemData
type RowItemData = { rows: any[][]; q: string; columns: number };

// ملاحظة: سيجري تعريف RowRenderer لاحقًا خلال useCallback داخل المكوّن لتجنّب الاعتماد الخارجي.

// ص Flake JSON منخفض المستوى
async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export default function IndividualsPage() {
  // أضف الحالات выше المكوّن (بعد بداية المكوّن مباشرة وقبل أي JSX)
  // إذا كانت معرفة مسبقًا، لا تكرّرها. لكن بما أن TypeScript يشتكي من عدم وجودها، نعرّفها هنا:
  const [q, setQ] = React.useState<string>("");
  const [leaderName, setLeaderName] = React.useState<string>("");
  // ن Mistress stationNumber كسلسلة نقطة
  const [stationNumber, setStationNumber] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(50);
  // قيم الفرز الافتراضية كما بالمطلوب
  const [sortBy, setSortBy] = React.useState<"id" | "votes_count">("id");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  // Debug Panel مخفية افتراضياً
  const [showDebug, setShowDebug] = React.useState(false);

  // حالة الانشغال Lربط disabled على عناصر التحكم
  // (تم نقل تعريف isBusy بعد useInfiniteQuery)

  // حماية الصفحة عبر التحقق من الجلسة والصلاحيات
  const { loading, isAuthenticated } = useAuth();
  const { has, loading: permsLoading } = usePermissions();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || permsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const allowed = has('individuals.read');
  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" /> غير مصرح لك
            </CardTitle>
            <CardDescription>لا تملك صلاحية عرض هذه الصفحة (individuals.read).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>العودة للرئيسية <Home className="h-4 w-4 mr-2" /></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // =======================
  // قائمة القادة (dropdown)
  // =======================

  // معلمات وقيم البحث داخل القائمة المنسدلة
  const [leadersQ, setLeadersQ] = React.useState<string>("");

  // جلب القادة بتمرير لانهائي
  type LeadersResp = { data: LeaderOption[]; nextCursor?: string | null; hasNext?: boolean };
  const leadersQueryKey = React.useMemo(
    () => ['leaders', { q: leadersQ }],
    [leadersQ]
  );

  const fetchLeaders = React.useCallback(async ({ pageParam }: { pageParam?: string }) => {
    const sp = new URLSearchParams();
    if (leadersQ) sp.set('q', leadersQ);
    if (pageParam) sp.set('cursor', pageParam);
    // يدعم API الحالي إرجاع [{id, full_name}]؛ سنفرض غلاف data عند الحاجة
    const url = `/api/leaders?${sp.toString()}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch leaders: ${res.status}`);
    const json = await res.json();
    // توحيد الشكل إلى { data, nextCursor, hasNext }
    if (Array.isArray(json)) {
      return { data: json as LeaderOption[], nextCursor: null, hasNext: false } as LeadersResp;
    }
    return json as LeadersResp;
  }, [leadersQ]);

  const {
    data: leadersPages,
    isLoading: isLoadingLeaders,
    isFetching: isFetchingLeaders,
    isFetchingNextPage: isFetchingNextLeaders,
    hasNextPage: leadersHasNext,
    fetchNextPage: leadersFetchNext,
    refetch: refetchLeaders,
  } = useInfiniteQuery<LeadersResp, Error>({
    queryKey: leadersQueryKey,
    queryFn: ({ pageParam }) => fetchLeaders({ pageParam: typeof pageParam === 'string' ? pageParam : undefined }),
    getNextPageParam: (last) => (last?.nextCursor ? last.nextCursor : undefined),
    initialPageParam: undefined,
  });

  const leadersFlat: LeaderOption[] = React.useMemo(
    () => (leadersPages?.pages ?? []).flatMap((p) => p.data ?? []),
    [leadersPages]
  );

  // عند التحويم على قائد: نضبط leaderName لعرض أفراده بشكل فوري
  const handleLeaderHover = (name: string) => {
    if (isBusy) return;
    if (name !== leaderName) {
      setLeaderName(name);
    }
  };

  // عند الاختيار بالنقر: نضبط leaderName ونغلق القائمة (إن وُجدت مستقبلاً كمكوّن منفصل)
  const handleLeaderSelect = (name: string) => {
    setLeaderName(name);
  };

  // --- 1) تهيئة الحالات من URL مرة واحدة عند التحميل ---
  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);

      const urlQ = sp.get('q') ?? '';
      const urlLeader = sp.get('leader_name') ?? '';
      const urlStation = sp.get('station_number') ?? '';
      const urlPageSizeRaw = sp.get('pageSize');
      const urlSortByRaw = sp.get('sortBy');
      const urlSortDirRaw = sp.get('sortDir');

      const urlPageSize = urlPageSizeRaw ? Number(urlPageSizeRaw) : NaN;
      const urlSortBy = urlSortByRaw === 'id' || urlSortByRaw === 'votes_count' ? urlSortByRaw : 'id';
      const urlSortDir = urlSortDirRaw === 'asc' || urlSortDirRaw === 'desc' ? urlSortDirRaw : 'desc';

      // حدّث الحالات فقط إذا اختلفت عن القيم الحالية لتفادي إعادة الرندر غير الضروري
      if (urlQ !== q) setQ(urlQ);
      if (urlLeader !== leaderName) setLeaderName(urlLeader);
      if (urlStation !== stationNumber) setStationNumber(urlStation);
      if (!Number.isNaN(urlPageSize) && urlPageSize !== pageSize) setPageSize(urlPageSize);
      if (urlSortBy !== sortBy) setSortBy(urlSortBy);
      if (urlSortDir !== sortDir) setSortDir(urlSortDir);
    } catch {
      // تجاهل أي أخطاء parsing للـ URL
    }
    // نريد التشغيل مرة واحدة على التحميل؛ لا نضيف الحالات هنا لتفادي loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2) دفع تغييرات الحالات إلى URL بدون إعادة تحميل الصفحة ---
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);

    const setOrDelete = (key: string, value: string) => {
      if (value && value.length > 0) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
    };

    setOrDelete('q', q ?? '');
    setOrDelete('leader_name', leaderName ?? '');
    setOrDelete('station_number', stationNumber ?? '');
    // pageSize كلَم نكتبه لثبات السلوك
    sp.set('pageSize', String(pageSize));
    sp.set('sortBy', sortBy);
    sp.set('sortDir', sortDir);

    // لا ي хр basically أي cursor في العنوان عند تغيّر الفلاتر/الفرز حتى لا نظل على صفحة متقدمة
    sp.delete('cursor');

    const newSearch = sp.toString();
    const currentSearch = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;

    if (newSearch !== currentSearch) {
      const newUrl =
        window.location.pathname + (newSearch.length ? `?${newSearch}` : '') + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }, [q, leaderName, stationNumber, pageSize, sortBy, sortDir]);

  // اختيارياً: إعادة جلب البيانات عندما يتغير معلمات البحث المهمة يدوياً (عادة react-query يعيد الجلب بسبب queryKey)
  React.useEffect(() => {
    // react-query يعيد الجلب تلقائياً بسبب تغيّر queryKey، هذا للاحتياط إن رغبت باستدعاء refetch صريح
    // refetch();
  }, [q, leaderName, stationNumber, pageSize, sortBy, sortDir]);

  // === كتلة الاستعلام يجب أن تكون داخل المكوّن فقط ===
  type IndividualsPageResp = {
    data: any[];
    nextCursor?: string | null;
    hasNext?: boolean;
  };

  async function fetchPage({
    pageParam,
    q,
    leaderName,
    stationNumber,
    pageSize,
    sortBy,
    sortDir,
  }: {
    pageParam?: string;
    q: string;
    leaderName: string;
    stationNumber: string;
    pageSize: number;
    sortBy: 'id' | 'votes_count';
    sortDir: 'asc' | 'desc';
  }): Promise<IndividualsPageResp> {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (leaderName) params.set('leader_name', leaderName);
    if (stationNumber) params.set('station_number', stationNumber);
    params.set('pageSize', String(pageSize));
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);
    if (pageParam) params.set('cursor', pageParam);

    const url = `/api/individuals?${params.toString()}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch individuals: ${res.status}`);
    return (await res.json()) as IndividualsPageResp;
  }

  const queryKey = React.useMemo(
    () => ['individuals', { q, leaderName, stationNumber, pageSize, sortBy, sortDir }],
    [q, leaderName, stationNumber, pageSize, sortBy, sortDir]
  );

  const queryFnTyped = React.useCallback(
    ({ pageParam }: { pageParam?: unknown }) =>
      fetchPage({
        pageParam: typeof pageParam === 'string' ? pageParam : undefined,
        q: q ?? '',
        leaderName: leaderName ?? '',
        stationNumber: stationNumber ?? '',
        pageSize: Number(pageSize) || 50,
        sortBy: (sortBy === 'id' || sortBy === 'votes_count' ? sortBy : 'id') as
          | 'id'
          | 'votes_count',
        sortDir: (sortDir === 'asc' || sortDir === 'desc' ? sortDir : 'desc') as 'asc' | 'desc',
      }),
    [q, leaderName, stationNumber, pageSize, sortBy, sortDir]
  );

  const {
    data: pagesData,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<IndividualsPageResp, Error>({
    queryKey,
    queryFn: queryFnTyped,
    getNextPageParam: (lastPage) => (lastPage?.nextCursor != null ? lastPage.nextCursor : undefined),
    initialPageParam: undefined,
  });

  // تعريف isBusy بعد تو توفير isLoading/isFetching (مرة واحدة)
  const isBusy = isLoading || isFetching;

  const flatData = pagesData?.pages.flatMap((p) => p.data) ?? [];

  // حالات واجهة العرض
  const pageSizeOptions = [25, 50, 100, 200];

  // دوال مساعدة للفرز
  const setSort = (by: 'id' | 'votes_count', dir: 'asc' | 'desc') => {
    if (isBusy) return;
    setSortBy(by);
    setSortDir(dir);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* العنوان وشريط الأدوات */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">إدارة الأفراد</h1>
          <div className="text-xs text-muted-foreground">
            {isBusy ? 'جارِ التحميل...' : `عدد النتائج الحالية: ${flatData.length}`}
          </div>
        </div>

        {/* فلاتر البحث الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label htmlFor="q">بحث</Label>
            <Input
              id="q"
              placeholder="ابحث بالاسم، الهاتف، جهة العمل..."
              value={q}
              disabled={isBusy}
              onChange={(e) => setQ(e.target.value)}
              className="bg-background"
            />
          </div>

          {/* قائمة منسدلة للقادة مع بحث وتمرير */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label htmlFor="leaders">القادة</Label>
            <div className="border rounded bg-card text-card-foreground">
              {/* حقل بحث داخل القائمة */}
              <div className="p-2 border-b">
                <Input
                  id="leaders"
                  placeholder="ابحث عن قائد..."
                  value={leadersQ}
                  disabled={isFetchingLeaders}
                  onChange={(e) => setLeadersQ(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* جسم القائمة مع تمرير، عند التحويم نعرض الأفراد */}
              <div
                className="max-h-56 overflow-auto"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (leadersHasNext && !isFetchingNextLeaders && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
                    leadersFetchNext();
                  }
                }}
              >
                {isLoadingLeaders && (
                  <div className="p-3 text-sm text-muted-foreground">جارِ تحميل القادة...</div>
                )}
                {!isLoadingLeaders && leadersFlat.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">لا يوجد قادة مطابقة.</div>
                )}
                {leadersFlat.map((ldr) => (
                  <button
                    key={ldr.id}
                    type="button"
                    className={`w-full text-right px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      leaderName === ldr.full_name ? 'bg-muted' : 'hover:bg-muted'
                    }`}
                    onMouseEnter={() => handleLeaderHover(ldr.full_name)}
                    onClick={() => handleLeaderSelect(ldr.full_name)}
                  >
                    {ldr.full_name}
                  </button>
                ))}
                {isFetchingNextLeaders && (
                  <div className="p-2 text-xs text-muted-foreground text-center">تحميل المزيد...</div>
                )}
              </div>
            </div>

            {/* وسم يوضّح القائد الحالي المختار */}
            {leaderName && (
              <div className="text-xs text-muted-foreground mt-1">
                القائد المختار: <span className="font-medium text-foreground">{leaderName}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="station">رقم المحطة</Label>
            <Input
              id="station"
              placeholder="رقم المحطة"
              value={stationNumber}
              disabled={isBusy}
              onChange={(e) => setStationNumber(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="pageSize">حجم الصفحة</Label>
            <select
              id="pageSize"
              className="border rounded px-3 py-2 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isBusy}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* أدوات الفرز */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">الفرز حسب:</span>
          <div className="inline-flex overflow-hidden rounded border">
            <button
              type="button"
              className={`px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'id' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => setSort('id', sortDir)}
              disabled={isBusy}
            >
              المعرّف
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'votes_count' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => setSort('votes_count', sortDir)}
              disabled={isBusy}
            >
              عدد الأصوات
            </button>
          </div>

          <div className="inline-flex overflow-hidden rounded border ms-2">
            <button
              type="button"
              className={`px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortDir === 'asc' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => setSort(sortBy, 'asc')}
              disabled={isBusy}
            >
              تصاعدي
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortDir === 'desc' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => setSort(sortBy, 'desc')}
              disabled={isBusy}
            >
              تنازلي
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="ms-auto"
            disabled={isBusy}
            onClick={() => {
              setQ('');
              setLeaderName('');
              setStationNumber('');
              setSortBy('id');
              setSortDir('desc');
              setPageSize(50);
            }}
          >
            إعادة ضبط
          </Button>
        </div>
      </div>

      {/* شبكة البطاقات */}
      <div className="border rounded p-3 bg-card/30">
        {isLoading && (
          <div className="p-2">
            <SkeletonGrid rows={2} cols={3} />
          </div>
        )}

        {!isLoading && flatData.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة للبحث الحالي.</div>
        )}

        {!isLoading && flatData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {flatData.map((row: any) => (
              <div key={row.id} className="rounded border p-3 bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-base">#{row.id}</div>
                  <div className="text-xs text-muted-foreground">الأصوات: {row.votes_count ?? '-'}</div>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">الاسم الكامل: </span>
                    <span className="font-medium">{showText(row.full_name)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">اسم المسؤول: </span>
                    <span className="font-medium">{showText(row.leader_name)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">رقم الهاتف: </span>
                    <span className="font-medium">{showText(row.phone)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">السكن: </span>
                    <span className="font-medium">{showText(row.residence)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">جهة العمل: </span>
                    <span className="font-medium">{showText(row.workplace)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">رقم المحطة: </span>
                    <span className="font-medium">{showText(row.station_number)}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" disabled className="opacity-60 cursor-not-allowed">
                    تعديل
                  </Button>
                  <Button type="button" size="sm" variant="destructive" disabled className="opacity-60 cursor-not-allowed">
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            disabled={isBusy || !hasNextPage || isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isFetchingNextPage ? 'جارِ التحميل...' : hasNextPage ? 'تحميل المزيد' : 'لا مزيد من النتائج'}
          </Button>
        </div>
      </div>
    </div>
  );
}

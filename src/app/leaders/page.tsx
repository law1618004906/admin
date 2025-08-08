'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  TrendingUp,
  MapPin,
  Phone,
  Building,
  Vote,
  Users2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type LeaderItem = {
  id: number;
  full_name: string;
  residence: string | null;
  phone: string | null;
  workplace: string | null;
  center_info: string | null;
  station_number: string | null;
  votes_count: number | null;
  created_at: string;
  updated_at: string;
  _count?: {
    individuals?: number;
  };
  totalIndividualsVotes?: number;
  individualsPreview?: string[];
};

type LeadersApiResponse = {
  success: boolean;
  data: LeaderItem[];
  total?: number;
};

// تعريف نوع الأفراد المستخدم في الشجرة
type PersonNode = {
  id: number;
  leader_name: string | null;
  full_name: string;
  residence: string | null;
  phone: string | null;
  workplace: string | null;
  center_info: string | null;
  station_number: string | null;
  votes_count: number | null;
  created_at: string;
  updated_at?: string;
};

// أدوات بسيطة لاستدعاءات CRUD على الأفراد
async function apiUpdatePerson(
  id: number,
  body: Partial<{
    leader_name: string;
    full_name: string;
    votes_count: number;
    residence: string;
    phone: string;
    workplace: string;
    center_info: string;
    station_number: string;
  }>
) {
  const res = await fetch(
    '/api/individuals',
    withCsrf({
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, ...body }),
    })
  );
  if (!res.ok) throw new Error(`PATCH /api/individuals failed: ${res.status}`);
  return res.json();
}

async function apiDeletePerson(id: number) {
  const res = await fetch(
    '/api/individuals',
    withCsrf({
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
  );
  if (!res.ok) throw new Error(`DELETE /api/individuals failed: ${res.status}`);
  return res.json();
}

async function apiCreatePerson(payload: {
  leader_name: string;
  full_name: string;
  votes_count?: number;
  residence?: string;
  phone?: string;
  workplace?: string;
  center_info?: string;
  station_number?: string;
}) {
  const res = await fetch(
    '/api/individuals',
    withCsrf({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
  );
  if (!res.ok) throw new Error(`POST /api/individuals failed: ${res.status}`);
  return res.json();
}

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-40"
      onClick={onClose}
      aria-label="close modal"
    />
  );
}

function Modal({
  title,
  children,
  onClose,
  maxWidth = 'max-w-3xl',
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  // منع تمرير الخلفية WHEN PRESSED ESCAPE
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', fn);
    return () => {
      document.removeEventListener('keydown', fn);
    };
  }, [onClose]);

  // منع تمرير الخلفية عند فتح المودال وإعادته عند الإغلاق
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // يمنع تمرير الخلفية
    return () => {
      document.body.style.overflow = original; // يعيد الوضع السابق
    };
  }, []);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
        role="dialog"
        aria-modal="true"
      >
        <div className={`w-full ${maxWidth} rounded-lg border border-gray-700 bg-gray-900 shadow-xl`}>
          <div className="flex items-center justify-between border-b border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1 text-sm bg-gray-800 text-gray-200 hover:bg-gray-700"
            >
              إغلاق
            </button>
          </div>
          {/* نMakeRange محتوى المودال قابل للتمرير بداخل المودال فقط */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}

// دالة مساعدة لعرض النص مع Fallback "لايوجد"
const showText = (v?: string | number | null) => {
  if (v === null || v === undefined) return 'لايوجد';
  const t = typeof v;
  if (t === 'string' || t === 'number' || t === 'bigint' || t === 'boolean') return String(v);
  // لو وصل كائن/مصفوفة بطريق الخطأ، لا نمرره كابن React بل نحوّله إلى نص آمن
  try { return JSON.stringify(v); } catch { return 'لايوجد'; }
};

// شجرة العلاقات البسيطة: قائد -> قائمة أفراده (الأحدث أولاً)
function RelationTree({
  leaderName,
  persons,
  onRefresh,
}: {
  leaderName: string;
  persons: PersonNode[];
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    leader_name: string;
    full_name: string;
    votes_count: string;
    residence: string;
    phone: string;
    workplace: string;
    center_info: string;
    station_number: string;
  }>({
    leader_name: leaderName,
    full_name: '',
    votes_count: '0',
    residence: '',
    phone: '',
    workplace: '',
    center_info: '',
    station_number: '',
  });
  const [busyId, setBusyId] = useState<number | 'create' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // نموذج الإضافة
  const [newData, setNewData] = useState<{
    full_name: string;
    votes_count: string;
    residence: string;
    phone: string;
    workplace: string;
    center_info: string;
    station_number: string;
  }>({
    full_name: '',
    votes_count: '0',
    residence: '',
    phone: '',
    workplace: '',
    center_info: '',
    station_number: '',
  });

  const totalVotes = useMemo(
    () =>
      persons.reduce((acc, p) => acc + (typeof p.votes_count === 'number' ? p.votes_count : 0), 0),
    [persons]
  );

  const beginEdit = (p: PersonNode) => {
    setEditingId(p.id);
    setEditData({
      leader_name: leaderName, // ثبّت اسم القائد من سياق المودال
      full_name: p.full_name,
      votes_count: String(p.votes_count ?? 0),
      residence: p.residence ?? '',
      phone: p.phone ?? '',
      workplace: p.workplace ?? '',
      center_info: p.center_info ?? '',
      station_number: p.station_number ?? '',
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = async (id: number) => {
    try {
      setBusyId(id);
      setError(null);
      const votes = Number.isFinite(Number(editData.votes_count)) ? Number(editData.votes_count) : 0;
      await apiUpdatePerson(id, {
        leader_name: leaderName, // إرسال اسم القائد من السياق دائماً
        full_name: editData.full_name.trim(),
        votes_count: votes,
        residence: editData.residence || null as any,
        phone: editData.phone || null as any,
        workplace: editData.workplace || null as any,
        center_info: editData.center_info || null as any,
        station_number: editData.station_number || null as any,
      });
      cancelEdit();
      onRefresh();
    } catch (e: any) {
      setError(e?.message ?? 'فشل التعديل');
    } finally {
      setBusyId(null);
    }
  };

  const deletePerson = async (id: number) => {
    if (!confirm('تأكيد حذف الفرد؟')) return;
    try {
      setBusyId(id);
      setError(null);
      await apiDeletePerson(id);
      onRefresh();
    } catch (e: any) {
      setError(e?.message ?? 'فشل الحذف');
    } finally {
      setBusyId(null);
    }
  };

  const createPerson = async () => {
    try {
      setBusyId('create');
      setError(null);
      const payload = {
        leader_name: leaderName, // ربط تلقائي بالقائد
        full_name: newData.full_name.trim(),
        votes_count: Number.isFinite(Number(newData.votes_count)) ? Number(newData.votes_count) : 0,
        residence: newData.residence || undefined,
        phone: newData.phone || undefined,
        workplace: newData.workplace || undefined,
        center_info: newData.center_info || undefined,
        station_number: newData.station_number || undefined,
      };
      if (!payload.full_name) throw new Error('الاسم الكامل مطلوب');
      await apiCreatePerson(payload);
      setNewData({
        full_name: '',
        votes_count: '0',
        residence: '',
        phone: '',
        workplace: '',
        center_info: '',
        station_number: '',
      });
      onRefresh();
    } catch (e: any) {
      setError(e?.message ?? 'فشل الإضافة');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      <div className="text-sm text-gray-300">
        شجرة العلاقات للقائد: <span className="text-white font-semibold">{leaderName}</span>
      </div>

      {/* إضافة فرد جديد لهذا القائد (جدول مبسّط بالحقول الثمانية) */}
      <div className="rounded-md bg-gray-800 p-3 space-y-3">
        <div className="text-sm text-gray-300 mb-2">إضافة فرد جديد لهذا القائد</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">الاسم الكامل</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              placeholder="الاسم الكامل"
              value={newData.full_name}
              onChange={(e) => setNewData((s) => ({ ...s, full_name: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">عدد الأصوات</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              placeholder="0"
              value={newData.votes_count}
              onChange={(e) => setNewData((s) => ({ ...s, votes_count: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">السكن</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              value={newData.residence}
              onChange={(e) => setNewData((s) => ({ ...s, residence: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">الهاتف</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              value={newData.phone}
              onChange={(e) => setNewData((s) => ({ ...s, phone: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">جهة العمل</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              value={newData.workplace}
              onChange={(e) => setNewData((s) => ({ ...s, workplace: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">معلومات المركز</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              value={newData.center_info}
              onChange={(e) => setNewData((s) => ({ ...s, center_info: e.target.value }))}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">رقم المحطة</div>
            <input
              className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
              value={newData.station_number}
              onChange={(e) => setNewData((s) => ({ ...s, station_number: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={createPerson}
            disabled={busyId === 'create'}
            className="rounded-md bg-teal-600 hover:bg-teal-500 text-white text-sm px-4 py-2 disabled:opacity-60"
          >
            {busyId === 'create' ? 'جارٍ الإضافة...' : 'إضافة'}
          </button>
          <div className="text-xs text-gray-500">
            سيتم ربط الفرد باسم القائد تلقائياً: <span className="text-gray-300">{leaderName}</span>
          </div>
        </div>
      </div>

      {/* الجذر: القائد */}
      <div className="rounded-md bg-gray-800 p-3">
        <div className="text-white font-semibold">{leaderName}</div>
        <div className="text-xs text-gray-400">المجموع الكلي للأصوات (ضمن الشجرة): {totalVotes}</div>
      </div>

      {/* الفروع: الأفراد (عرض جدول حقول الشخص الثمانية مع التحرير) */}
      <div className="ml-0 md:ml-4">
        <div className="text-sm text-gray-400 mb-2">الأفراد (الأحدث أولاً):</div>
        {persons.length > 0 ? (
          <ul className="space-y-3">
            {persons.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <li key={p.id} className="rounded-md bg-gray-800 p-3">
                  {!isEditing ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-200 font-medium">{p.full_name}</div>
                        <span className="text-xs text-gray-500">ID: {p.id}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-300">
                          اسم القائد: <span className="text-gray-200">{leaderName}</span>
                        </div>
                        <div className="text-gray-300">
                          الأصوات: <span className="text-gray-200">{p.votes_count ?? 0}</span>
                        </div>
                        <div className="text-gray-300">
                          السكن: <span className="text-gray-200">{p.residence ?? '—'}</span>
                        </div>
                        <div className="text-gray-300">
                          الهاتف: <span className="text-gray-200">{p.phone ?? '—'}</span>
                        </div>
                        <div className="text-gray-300">
                          جهة العمل: <span className="text-gray-200">{p.workplace ?? '—'}</span>
                        </div>
                        <div className="text-gray-300">
                          معلومات المركز: <span className="text-gray-200">{p.center_info ?? '—'}</span>
                        </div>
                        <div className="text-gray-300">
                          رقم المحطة: <span className="text-gray-200">{p.station_number ?? '—'}</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          أضيف في: {new Date(p.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => beginEdit(p)}
                          className="rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => deletePerson(p.id)}
                          disabled={busyId === p.id}
                          className="rounded-md bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1 disabled:opacity-60"
                        >
                          {busyId === p.id ? 'جارٍ الحذف...' : 'حذف'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* عرض فقط اسم القائد بدون إدخال لتحاسس الالتباس */}
                        <div className="text-gray-300">
                          <div className="text-xs text-gray-400 mb-1">اسم القائد</div>
                          <div className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-gray-300">
                            {leaderName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">الاسم الكامل</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.full_name}
                            onChange={(e) => setEditData((s) => ({ ...s, full_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">عدد الأصوات</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.votes_count}
                            onChange={(e) => setEditData((s) => ({ ...s, votes_count: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">السكن</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.residence}
                            onChange={(e) => setEditData((s) => ({ ...s, residence: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">الهاتف</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.phone}
                            onChange={(e) => setEditData((s) => ({ ...s, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">جهة العمل</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.workplace}
                            onChange={(e) => setEditData((s) => ({ ...s, workplace: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">معلومات المركز</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.center_info}
                            onChange={(e) => setEditData((s) => ({ ...s, center_info: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">رقم المحطة</div>
                          <input
                            className="w-full rounded-md bg-gray-900 border border-gray-700 p-2 text-sm text-white"
                            value={editData.station_number}
                            onChange={(e) => setEditData((s) => ({ ...s, station_number: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={busyId === p.id}
                          className="rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1 disabled:opacity-60"
                        >
                          {busyId === p.id ? 'جارٍ الحفظ...' : 'حفظ'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-md bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1"
                        >
                          إلغاء
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">لا توجد بيانات أفراد لهذا القائد.</div>
        )}
      </div>
    </div>
  );
}

export default function LeadersPage() {
  const [data, setData] = useState<LeaderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // حالة الـ Modal
  const [openLeader, setOpenLeader] = useState<LeaderItem | null>(null);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
  const [treeErr, setTreeErr] = useState<string | null>(null);
  const [treePersons, setTreePersons] = useState<PersonNode[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch('/api/leaders', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: LeadersApiResponse = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const items = json.data
            .sort((a, b) => b.id - a.id)
            .slice(0, 10);
          if (mounted) setData(items);
        } else {
          throw new Error('Invalid response shape');
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openTreeForLeader = async (leader: LeaderItem) => {
    setOpenLeader(leader);
    await refreshTree(leader.full_name);
  };

  const refreshTree = async (leaderFullName: string) => {
    setTreeLoading(true);
    setTreeErr(null);
    setTreePersons([]);
    try {
      const params = new URLSearchParams();
      if (leaderFullName) params.set('leader_name', leaderFullName);
      params.set('order', 'desc');
      params.set('limit', '200');
      const res = await fetch(`/api/individuals?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const persons: PersonNode[] = Array.isArray(json?.data)
        ? json.data
            .map((p: any) => ({
              id: p.id,
              leader_name: p.leader_name ?? null,
              full_name: p.full_name,
              residence: p.residence ?? null,
              phone: p.phone ?? null,
              workplace: p.workplace ?? null,
              center_info: p.center_info ?? null,
              station_number: p.station_number ?? null,
              votes_count:
                typeof p.votes_count === 'number' ? p.votes_count : Number(p.votes_count ?? 0),
              created_at: p.created_at,
              updated_at: p.updated_at,
            }))
            .sort((a: PersonNode, b: PersonNode) => b.id - a.id)
        : [];
      setTreePersons(persons);
    } catch (e: any) {
      setTreeErr(e?.message ?? 'Failed to load leader relations');
    } finally {
      setTreeLoading(false);
    }
  };

  const closeModal = () => {
    setOpenLeader(null);
    setTreePersons([]);
    setTreeErr(null);
    setTreeLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-300">جارٍ التحميل...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="text-red-400">خطأ: {err}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* عنوان الصفحة */}
      <h1 className="text-2xl font-bold mb-6 text-white">إدارة القادة</h1>

      {/* شبكة بطاقات القادة */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((leader) => {
          const individualsCount = leader._count?.individuals ?? 0;
          const votesSum = leader.totalIndividualsVotes ?? 0;
          const preview = leader.individualsPreview ?? [];

          return (
            <button
              type="button"
              key={leader.id}
              onClick={() => openTreeForLeader(leader)}
              className="text-left rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md hover:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {/* اسم القائد */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold !text-white">
                  {leader.full_name || '—'}
                </h2>
                <span className="text-xs text-gray-400">ID: {leader.id}</span>
              </div>

              {/* معلومات أساسية (اختيارية) */}
              <div className="space-y-1 text-sm">
                {leader.phone ? (
                  <div className="text-gray-300">
                    الهاتف: <span className="text-gray-200">{leader.phone}</span>
                  </div>
                ) : null}
                {leader.residence ? (
                  <div className="text-gray-300">
                    السكن: <span className="text-gray-200">{leader.residence}</span>
                  </div>
                ) : null}
                {leader.workplace ? (
                  <div className="text-gray-300">
                    جهة العمل: <span className="text-gray-200">{leader.workplace}</span>
                  </div>
                ) : null}
              </div>

              {/* إحصاءات الأفراد والأصوات */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-800 p-3">
                  <div className="text-xs text-gray-400">عدد الأفراد</div>
                  <div className="text-xl font-bold text-white">{individualsCount}</div>
                </div>
                <div className="rounded-md bg-gray-800 p-3">
                  <div className="text-xs text-gray-400">مجموع الأصوات</div>
                  <div className="text-xl font-bold text-white">{votesSum}</div>
                </div>
              </div>

              {/* معاينة الأفراد */}
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2">معاينة الأفراد (أحدث 5):</div>
                {Array.isArray(leader.individualsPreview) && leader.individualsPreview.length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {leader.individualsPreview.map((p: any, idx: number) => {
                      // حارس إضافي: إن كان p كائناً نقرأ الحقول ونحوّل كلها إلى نصوص
                      const full = showText(p?.full_name);
                      const phone = showText(p?.phone);
                      const res   = showText(p?.residence);
                      return (
                        <li key={idx} className="truncate">
                          <span className="font-medium">{full}</span>
                          <span className="mx-1">•</span>
                          <span>{phone}</span>
                          <span className="mx-1">•</span>
                          <span>{res}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">لايوجد أفراد للعرض</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ملاحظة: الصفحة تعرض فقط القادة من جدول leaders (10 من ورقة الإكسل) */}
      <div className="mt-6 text-xs text-gray-500">
        المصدر: جدول القادة (leaders) فقط. لا يتم الاعتماد على جدول الأفراد لاحتساب القادة.
      </div>

      {/* Modal شجرة العلاقات */}
      {openLeader && (
        <Modal
          title={`شجرة العلاقات - ${openLeader.full_name || ''}`}
          onClose={closeModal}
          maxWidth="max-w-5xl"
        >
          {treeLoading ? (
            <div className="text-gray-300">جارٍ تحميل شجرة العلاقات...</div>
          ) : treeErr ? (
            <div className="text-red-400">خطأ: {treeErr}</div>
          ) : (
            <RelationTree
              leaderName={openLeader.full_name}
              persons={treePersons}
              onRefresh={() => {
                if (openLeader?.full_name) refreshTree(openLeader.full_name);
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

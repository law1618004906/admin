'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Menu as MenuIcon, LogOut, Search, Plus, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function TopBar({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);

  type Action = { label: string; href: string; keywords: string[] };
  const actions: Action[] = useMemo(
    () => [
      { label: 'الرئيسية', href: '/', keywords: ['home', 'dashboard', 'main'] },
      { label: 'المنشورات', href: '/posts', keywords: ['posts', 'post', 'منشور'] },
      { label: 'إنشاء منشور', href: '/posts/create', keywords: ['create post', 'new post', 'posts create'] },
      { label: 'الرسائل', href: '/messages', keywords: ['messages', 'رسائل'] },
      { label: 'الأفراد', href: '/individuals', keywords: ['individuals', 'people', 'أفراد'] },
      { label: 'القيادات', href: '/leaders', keywords: ['leaders', 'leadership', 'قيادات', 'leaders tree', 'leaders-tree'] },
      { label: 'التقارير', href: '/reports', keywords: ['reports', 'تقارير'] },
      { label: 'الأدوار', href: '/roles', keywords: ['roles', 'صلاحيات', 'authorization'] },
      { label: 'الإعدادات', href: '/setup', keywords: ['settings', 'setup', 'إعدادات'] },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions.slice(0, 5);
    return actions
      .filter(a => a.label.toLowerCase().includes(q) || a.keywords.some(k => k.includes(q)))
      .slice(0, 7);
  }, [actions, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/';
      if (isCtrlK || isSlash) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setQuery('');
        inputRef.current?.blur();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = filtered[highlightIdx] || filtered[0];
    if (item) router.push(item.href);
    setOpen(false);
  };

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[highlightIdx] || filtered[0];
      if (item) {
        router.push(item.href);
        setOpen(false);
      }
    }
  };

  // إخفاء الشريط في صفحة تسجيل الدخول فقط
  if (pathname.startsWith('/login')) return null;

  return (
    <div
      className={[
        'fixed top-3 left-1/2 -translate-x-1/2 z-50',
        'w-[min(1100px,92vw)]',
        className,
      ].join(' ')}
    >
      <div
        className={cn(
          'rounded-2xl border border-white/10',
          'bg-gray-900/40 backdrop-blur-xl',
          'shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
        )}
      >
        <div className="flex items-center w-full gap-2 px-2 py-1.5">
          {/* زر القائمة - قابل للتوسعة مستقبلاً لفتح Sidebar */}
          <div className="flex items-center text-gray-200 pr-1">
            <SidebarTrigger className="text-gray-200 hover:text-white hover:bg-white/10" />
            <span className="ml-2 hidden sm:inline">القائمة</span>
          </div>

          {/* حقل البحث السريع مع اختصار Ctrl/⌘+K أو / */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlightIdx(0); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                onKeyDown={onKeyDownInput}
                placeholder="بحث سريع... (Ctrl+K)"
                className="pr-9 bg-white/5 border-white/10 text-white placeholder:text-white/50"
              />
              {open && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-white/10 bg-gray-900/95 backdrop-blur p-1 shadow-xl">
                  {filtered.map((item, idx) => (
                    <button
                      key={item.href}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { router.push(item.href); setOpen(false); }}
                      className={cn(
                        'w-full text-right px-3 py-2 rounded-md text-sm text-white/90 hover:bg-white/10 flex items-center justify-between',
                        idx === highlightIdx && 'bg-white/10'
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-white/40 text-xs">{item.href}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* زر إنشاء موحّد */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuLabel>إجراءات سريعة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/posts/create')}>منشور جديد</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/messages')}>رسالة</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* زر رجوع */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-200 hover:text-white hover:bg-white/10 pl-3"
            title="رجوع"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">رجوع</span>
          </Button>

          {/* قائمة المستخدم */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-200 hover:text-white hover:bg-white/10">
                  <User2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/')}>الملف الشخصي</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  <LogOut className="h-4 w-4 ml-2" /> خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}


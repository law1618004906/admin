"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  AlertCircle,
  Home,
  ArrowUpDown
} from 'lucide-react';
import EmptyState from '@/components/custom/empty-state';
import PermissionGuard from '@/components/custom/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';

interface Post {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  campaign?: {
    id: string;
    title: string;
    titleAr: string;
  };
  author?: {
    id: string;
    name: string;
    email: string;
  };
  interactions: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { has } = usePermissions();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<'title' | 'createdAt' | 'publishedAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const { data, isLoading: dataLoading, isError, refetch } = useQuery({
    queryKey: ['posts'],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/posts', { credentials: 'include' });
      if (!res.ok) throw new Error('تعذر جلب المنشورات');
      const body = await res.json();
      return (body.data?.posts || body.data || []) as Post[];
    },
    staleTime: 30_000,
  });

  const posts = data ?? [];

  useEffect(() => {
    if (isError) {
      toast({
        title: 'فشل تحميل المنشورات',
        description: 'تحقق من اتصالك وحاول مرةً أخرى.',
        variant: 'destructive',
      });
    }
  }, [isError]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }
    filtered.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = sortKey === 'title' ? a.title : (a.publishedAt || a.createdAt);
      const bv = sortKey === 'title' ? b.title : (b.publishedAt || b.createdAt);
      return av.localeCompare(bv) * dir;
    });
    return filtered;
  }, [posts, searchTerm, statusFilter, sortKey, sortDir]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">مسودة</Badge>;
      case 'PUBLISHED':
        return <Badge variant="default" className="bg-green-600">منشور</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">مؤرشف</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Home className="h-4 w-4 ml-2" />
                الرئيسية
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                إدارة المنشورات
              </h1>
            </div>
            
            <PermissionGuard anyOf={["posts.create"]} mode="hide">
              <Button
                onClick={() => router.push('/posts/create')}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Plus className="h-4 w-4" />
                <span>إنشاء منشور</span>
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="بحث في المنشورات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="DRAFT">مسودة</option>
            <option value="PUBLISHED">منشور</option>
            <option value="ARCHIVED">مؤرشف</option>
          </select>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>شبكي</Button>
            <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>جدول</Button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {dataLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border p-4 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {!dataLoading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    {getStatusBadge(post.status)}
                  </div>
                  <CardDescription className="line-clamp-3">
                    {post.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>
                        {post.publishedAt 
                          ? `نشر في: ${new Date(post.publishedAt).toLocaleDateString('ar-SA')}`
                          : `إنشاء في: ${new Date(post.createdAt).toLocaleDateString('ar-SA')}`
                        }
                      </span>
                    </div>
                    {post.campaign && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        الحملة: {post.campaign.titleAr}
                      </div>
                    )}
                    {post.author && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        الكاتب: {post.author.name}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                        <div className="flex items-center"><Eye className="h-4 w-4 ml-1" /><span>{post.interactions?.views || 0}</span></div>
                        <div className="flex items-center"><Heart className="h-4 w-4 ml-1" /><span>{post.interactions?.likes || 0}</span></div>
                        <div className="flex items-center"><Share2 className="h-4 w-4 ml-1" /><span>{post.interactions?.shares || 0}</span></div>
                        <div className="flex items-center"><MessageCircle className="h-4 w-4 ml-1" /><span>{post.interactions?.comments || 0}</span></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/posts/${post.id}`)}>عرض التفاصيل</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!dataLoading && viewMode === 'table' && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selected.size > 0 && selected.size === filteredPosts.length}
                      onCheckedChange={(v) => {
                        if (v) setSelected(new Set(filteredPosts.map(p => p.id)));
                        else setSelected(new Set());
                      }}
                      aria-label="تحديد الكل"
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => { setSortKey('title'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                    العنوان
                    <ArrowUpDown className="inline h-4 w-4 mr-1" />
                  </TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => { setSortKey('publishedAt'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                    التاريخ
                    <ArrowUpDown className="inline h-4 w-4 mr-1" />
                  </TableHead>
                  <TableHead>تفاعل</TableHead>
                  <TableHead className="text-left">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map(post => (
                  <TableRow key={post.id} data-state={selected.has(post.id) ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(post.id)}
                        onCheckedChange={(v) => {
                          const next = new Set(selected);
                          if (v) next.add(post.id); else next.delete(post.id);
                          setSelected(next);
                        }}
                        aria-label={`تحديد ${post.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      {post.publishedAt 
                        ? new Date(post.publishedAt).toLocaleDateString('ar-SA')
                        : new Date(post.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      👁️ {post.interactions?.views || 0} · ❤ {post.interactions?.likes || 0} · ↗ {post.interactions?.shares || 0} · 💬 {post.interactions?.comments || 0}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/posts/${post.id}`)}>عرض</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!dataLoading && filteredPosts.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="لا توجد منشورات"
              description={
                searchTerm || statusFilter !== 'all'
                  ? 'لا توجد منشورات تطابق معايير البحث'
                  : 'ابدأ بإنشاء منشور جديد'
              }
              icon={<AlertCircle className="h-7 w-7" />}
              actionLabel={!searchTerm && statusFilter === 'all' && has('posts.create') ? 'إنشاء منشور جديد' : undefined}
              onAction={
                !searchTerm && statusFilter === 'all' && has('posts.create')
                  ? () => router.push('/posts/create')
                  : undefined
              }
            />
          </div>
        )}
        {isError && (
          <div className="py-8 flex items-center justify-center">
            <Button onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
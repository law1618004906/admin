'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  User,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Home
} from 'lucide-react';

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

export default function PostDetailPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user && params.id) {
      fetchPost();
    }
  }, [isAuthenticated, user, params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setPost(data.data);
      } else if (response.status === 404) {
        setError('المنشور غير موجود');
      } else {
        setError('فشل في تحميل بيانات المنشور');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('حدث خطأ أثناء تحميل بيانات المنشور');
    } finally {
      setDataLoading(false);
    }
  };

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

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${params.id}`,
        withCsrf({ method: 'DELETE', credentials: 'include' })
      );

      if (response.ok) {
        router.push('/posts');
      } else {
        alert('فشل في حذف المنشور');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('حدث خطأ أثناء حذف المنشور');
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
                onClick={() => router.push('/posts')}
                className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4 ml-2" />
                الرجوع
              </Button>
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
                تفاصيل المنشور
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/posts/${params.id}/edit`)}
              >
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {error}
            </h3>
            <Button onClick={() => router.push('/posts')}>
              العودة إلى المنشورات
            </Button>
          </div>
        ) : post ? (
          <div className="space-y-6">
            {/* Post Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(post.status)}
                    </div>
                  </div>
                  <div className="text-left text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">الحالة:</span>
                    <span className="mr-2">
                      {getStatusBadge(post.status)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">تاريخ النشر:</span>
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      {post.publishedAt 
                        ? new Date(post.publishedAt).toLocaleDateString('ar-SA')
                        : 'غير منشور بعد'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Content */}
            <Card>
              <CardHeader>
                <CardTitle>محتوى المنشور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* Post Details */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المنشور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {post.author && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4 ml-2" />
                      <span>الكاتب: {post.author.name}</span>
                    </div>
                  )}
                  
                  {post.campaign && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      الحملة: {post.campaign.titleAr}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 ml-2" />
                    <span>إنشاء في: {new Date(post.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 ml-2" />
                    <span>تحديث في: {new Date(post.updatedAt).toLocaleString('ar-SA')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interaction Stats */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات التفاعل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.interactions?.views || 0}
                    </div>
                    <div className="text-sm text-gray-500">مشاهدة</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.interactions?.likes || 0}
                    </div>
                    <div className="text-sm text-gray-500">إعجاب</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Share2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.interactions?.shares || 0}
                    </div>
                    <div className="text-sm text-gray-500">مشاركة</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.interactions?.comments || 0}
                    </div>
                    <div className="text-sm text-gray-500">تعليق</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على المنشور
            </h3>
            <Button onClick={() => router.push('/posts')}>
              العودة إلى المنشورات
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { withCsrf } from '@/lib/csrf-client';
import PermissionGuard from '@/components/custom/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Send, 
  Calendar, 
  Image, 
  Video, 
  X,
  Home,
  Loader2
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  titleAr: string;
  status: string;
}

interface PostData {
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  type: 'ANNOUNCEMENT' | 'NEWS' | 'EVENT' | 'PRESS_RELEASE' | 'SOCIAL_MEDIA' | 'INTERNAL';
  campaignId: string;
  imageUrl?: string;
  videoUrl?: string;
  scheduledAt?: string;
}

export default function CreatePostPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { has, loading: permsLoading } = usePermissions();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostData>({
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    type: 'ANNOUNCEMENT',
    campaignId: '',
    imageUrl: '',
    videoUrl: '',
    scheduledAt: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCampaigns();
    }
  }, [isAuthenticated, user]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        credentials: 'include', // لضمان إرسال الكوكي HttpOnly
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data?.campaigns || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'publish') => {
    e.preventDefault();
    if (!formData.title || !formData.titleAr || !formData.campaignId) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const postData = {
        ...formData,
        status: action === 'publish' ? 'PUBLISHED' : 'DRAFT',
      };
      const response = await fetch(
        '/api/posts',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(postData),
        })
      );
      if (response.ok) {
        const result = await response.json();
        // Send Telegram notification (hidden integration)
        try {
          const telegramResponse = await fetch(
            '/api/telegram',
            withCsrf({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || '',
                text: `📰 *منشور جديد*\n\n*العنوان:* ${formData.titleAr}\n*النوع:* ${getPostTypeLabel(formData.type)}\n*الحالة:* ${action === 'publish' ? 'منشور' : 'مسودة'}\n*الكاتب:* ${user?.name || 'نظام'}\n*الوقت:* ${new Date().toLocaleString('ar-SA')}\n\n${formData.contentAr ? formData.contentAr.substring(0, 200) + '...' : ''}`,
                parse_mode: 'Markdown',
              }),
            })
          );
          if (!telegramResponse.ok) {
            console.warn('Telegram notification failed, but post was created successfully');
          }
        } catch (telegramError) {
          console.warn('Telegram notification error:', telegramError);
        }
        alert(action === 'publish' ? 'تم نشر المنشور بنجاح' : 'تم حفظ المسودة بنجاح');
        router.push('/posts');
      } else {
        const errorData = await response.json();
        alert(`فشل ${action === 'publish' ? 'نشر' : 'حفظ'} المنشور: ${errorData.error || 'حدث خطأ'}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`حدث خطأ أثناء ${action === 'publish' ? 'نشر' : 'حفظ'} المنشور`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return 'إعلان';
      case 'NEWS': return 'خبر';
      case 'EVENT': return 'فعالية';
      case 'PRESS_RELEASE': return 'بيان صحفي';
      case 'SOCIAL_MEDIA': return 'وسائط اجتماعية';
      case 'INTERNAL': return 'داخلي';
      default: return type;
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

  // منع الدخول إن لم تتوفر صلاحية إنشاء منشور
  if (!permsLoading && !has('posts.create')) {
    // يمكن لاحقًا إظهار صفحة 403 مخصصة
    if (typeof window !== 'undefined') {
      router.replace('/posts');
    }
    return null;
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
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                إنشاء منشور جديد
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={(e) => handleSubmit(e, 'draft')}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
                <CardDescription>
                  أدخل المعلومات الأساسية للمنشور
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      العنوان (إنجليزي) *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter post title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      العنوان (عربي) *
                    </label>
                    <Input
                      value={formData.titleAr}
                      onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                      placeholder="أدخل عنوان المنشور"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      نوع المنشور *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="ANNOUNCEMENT">إعلان</option>
                      <option value="NEWS">خبر</option>
                      <option value="EVENT">فعالية</option>
                      <option value="PRESS_RELEASE">بيان صحفي</option>
                      <option value="SOCIAL_MEDIA">وسائط اجتماعية</option>
                      <option value="INTERNAL">داخلي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الحملة *
                    </label>
                    {dataLoading ? (
                      <div className="flex items-center justify-center h-10">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <select
                        value={formData.campaignId}
                        onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        required
                      >
                        <option value="">اختر الحملة</option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.titleAr}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>المحتوى</CardTitle>
                <CardDescription>
                  أدخل محتوى المنشور
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    المحتوى (إنجليزي)
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Enter post content"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    المحتوى (عربي)
                  </label>
                  <Textarea
                    value={formData.contentAr}
                    onChange={(e) => setFormData({...formData, contentAr: e.target.value})}
                    placeholder="أدخل محتوى المنشور"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>الوسائط</CardTitle>
                <CardDescription>
                  أضف صور أو فيديوهات للمنشور (اختياري)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    رابط الصورة
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Image className="h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    رابط الفيديو
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Video className="h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                      placeholder="https://example.com/video.mp4"
                      type="url"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>الجدولة</CardTitle>
                <CardDescription>
                  جدولة النشر (اختياري)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    وقت النشر
                  </label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                      placeholder="2024-01-01T12:00"
                      type="datetime-local"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    اتركه فارغاً للنشر الفوري
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4 space-x-reverse">
              <PermissionGuard anyOf={["posts.create"]} mode="disable">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/posts')}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
              </PermissionGuard>
              <PermissionGuard anyOf={["posts.create"]} mode="disable">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  حفظ مسودة
                </Button>
              </PermissionGuard>
              <PermissionGuard anyOf={["posts.create"]} mode="disable">
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'publish')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Send className="h-4 w-4 ml-2" />
                  )}
                  نشر المنشور
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
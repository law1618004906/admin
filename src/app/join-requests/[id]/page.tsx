'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  X,
  Home,
  FileText,
  Building
} from 'lucide-react';

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  experience?: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  campaign: {
    id: string;
    title: string;
    titleAr: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function JoinRequestDetailPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const { has } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user && params.id && has('join_requests.read')) {
      fetchJoinRequest();
    }
  }, [isAuthenticated, user, params.id, has]);

  const fetchJoinRequest = async () => {
    try {
      const response = await fetch(`/api/join-requests/${params.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setJoinRequest(data.data);
      } else if (response.status === 404) {
        setError('طلب الانضمام غير موجود');
      } else {
        setError('فشل في تحميل بيانات طلب الانضمام');
      }
    } catch (error) {
      console.error('Error fetching join request:', error);
      setError('حدث خطأ أثناء تحميل بيانات طلب الانضمام');
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">مقبول</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = async (status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`هل أنت متأكد من ${status === 'APPROVED' ? 'قبول' : 'رفض'} هذا الطلب؟`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/join-requests/${params.id}`,
        withCsrf({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        })
      );

      if (response.ok) {
        await fetchJoinRequest();
      } else {
        alert(`فشل في ${status === 'APPROVED' ? 'قبول' : 'رفض'} الطلب`);
      }
    } catch (error) {
      console.error('Error updating join request:', error);
      alert(`حدث خطأ أثناء ${status === 'APPROVED' ? 'قبول' : 'رفض'} الطلب`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !has('join_requests.read')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <FileText className="h-5 w-5" />
              <span>غير مصرح</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              ليس لديك صلاحية للوصول إلى صفحة تفاصيل طلبات الانضمام.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
                onClick={() => router.push('/join-requests')}
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
                تفاصيل طلب الانضمام
              </h1>
            </div>
            
            {has('join_requests.update') && joinRequest?.status === 'PENDING' && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('APPROVED')}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4 ml-2" />
                  قبول
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('REJECTED')}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 ml-2" />
                  رفض
                </Button>
              </div>
            )}
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
            <Button onClick={() => router.push('/join-requests')}>
              العودة إلى طلبات الانضمام
            </Button>
          </div>
        ) : joinRequest ? (
          <div className="space-y-6">
            {/* Request Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{joinRequest.name}</CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(joinRequest.status)}
                      {joinRequest.position && (
                        <Badge variant="outline">{joinRequest.position}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-left text-sm text-gray-500">
                    {new Date(joinRequest.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">الحالة:</span>
                    <span className="mr-2">
                      {getStatusBadge(joinRequest.status)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">تاريخ التقديم:</span>
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      {new Date(joinRequest.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 ml-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">الاسم الكامل</div>
                        <div className="text-lg font-semibold">{joinRequest.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 ml-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">البريد الإلكتروني</div>
                        <div className="text-lg">{joinRequest.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 ml-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-500">رقم الهاتف</div>
                        <div className="text-lg">{joinRequest.phone}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {joinRequest.position && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">المسمى الوظيفي</div>
                        <Badge variant="outline" className="text-base">
                          {joinRequest.position}
                        </Badge>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">الحملة</div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Building className="h-4 w-4 ml-2" />
                        <span>{joinRequest.campaign.titleAr}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            {joinRequest.experience && (
              <Card>
                <CardHeader>
                  <CardTitle>الخبرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{joinRequest.experience}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message */}
            {joinRequest.message && (
              <Card>
                <CardHeader>
                  <CardTitle>رسالة إضافية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{joinRequest.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>الجدول الزمني</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 ml-2" />
                    <span>تاريخ التقديم: {new Date(joinRequest.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                  
                  {joinRequest.reviewedAt && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4 ml-2" />
                      <span>تاريخ المراجعة: {new Date(joinRequest.reviewedAt).toLocaleString('ar-SA')}</span>
                    </div>
                  )}
                  
                  {joinRequest.reviewer && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      المراجع: {joinRequest.reviewer.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على طلب الانضمام
            </h3>
            <Button onClick={() => router.push('/join-requests')}>
              العودة إلى طلبات الانضمام
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
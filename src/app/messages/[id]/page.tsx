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
  Send, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Home
} from 'lucide-react';

interface Message {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  type: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH_NOTIFICATION';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'FAILED';
  recipients: string[]; // Array of recipient IDs
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
    nameAr: string;
  };
}

export default function MessageDetailPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<Message | null>(null);
  const [recipients, setRecipients] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user && params.id) {
      fetchMessage();
    }
  }, [isAuthenticated, user, params.id]);

  const fetchMessage = async () => {
    try {
      const response = await fetch(`/api/messages/${params.id}`, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.data);
        
        // Fetch recipients details
        if (data.data.recipients && data.data.recipients.length > 0) {
          fetchRecipients(data.data.recipients);
        }
      } else if (response.status === 404) {
        setError('الرسالة غير موجودة');
      } else {
        setError('فشل في تحميل بيانات الرسالة');
      }
    } catch (error) {
      console.error('Error fetching message:', error);
      setError('حدث خطأ أثناء تحميل بيانات الرسالة');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchRecipients = async (recipientIds: string[]) => {
    try {
      const response = await fetch('/api/users', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        const allUsers = data.data?.users || data.data || [];
        const filteredRecipients = allUsers.filter((user: User) => 
          recipientIds.includes(user.id)
        );
        setRecipients(filteredRecipients);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">مسودة</Badge>;
      case 'SCHEDULED':
        return <Badge variant="outline">مجدول</Badge>;
      case 'SENT':
        return <Badge variant="default">مرسل</Badge>;
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">مستلم</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SMS':
        return <Badge variant="outline">رسالة نصية</Badge>;
      case 'WHATSAPP':
        return <Badge variant="outline" className="bg-green-100 text-green-800">واتساب</Badge>;
      case 'EMAIL':
        return <Badge variant="outline">بريد إلكتروني</Badge>;
      case 'PUSH_NOTIFICATION':
        return <Badge variant="outline">إشعار</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/messages/${params.id}`,
        withCsrf({ method: 'DELETE', credentials: 'include' })
      );

      if (response.ok) {
        router.push('/messages');
      } else {
        alert('فشل في حذف الرسالة');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('حدث خطأ أثناء حذف الرسالة');
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
                onClick={() => router.push('/messages')}
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
                تفاصيل الرسالة
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/messages/${params.id}/edit`)}
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
            <Button onClick={() => router.push('/messages')}>
              العودة إلى الرسائل
            </Button>
          </div>
        ) : message ? (
          <div className="space-y-6">
            {/* Message Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{message.titleAr}</CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(message.status)}
                      {getTypeBadge(message.type)}
                    </div>
                  </div>
                  <div className="text-left text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">المرسل:</span>
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      {message.sender?.name || 'غير معروف'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">عدد المستلمين:</span>
                    <span className="mr-2 text-gray-600 dark:text-gray-400">
                      {message.recipients.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Content */}
            <Card>
              <CardHeader>
                <CardTitle>محتوى الرسالة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{message.contentAr}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>الجدول الزمني</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 ml-2" />
                    <span>إنشاء في: {new Date(message.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                  
                  {message.scheduledAt && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4 ml-2" />
                      <span>مجدول للإرسال في: {new Date(message.scheduledAt).toLocaleString('ar-SA')}</span>
                    </div>
                  )}
                  
                  {message.sentAt && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Send className="h-4 w-4 ml-2" />
                      <span>أرسلت في: {new Date(message.sentAt).toLocaleString('ar-SA')}</span>
                    </div>
                  )}
                  
                  {message.deliveredAt && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                      <CheckCircle className="h-4 w-4 ml-2" />
                      <span>تم التسليم في: {new Date(message.deliveredAt).toLocaleString('ar-SA')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recipients */}
            {recipients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 ml-2" />
                    المستلمون ({recipients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {recipient.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {recipient.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {recipient.role.nameAr}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لم يتم العثور على الرسالة
            </h3>
            <Button onClick={() => router.push('/messages')}>
              العودة إلى الرسائل
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
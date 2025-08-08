'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Search, 
  Users, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  Crown,
  Users2,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  type: 'MANAGER_TO_LEADERS';
  status: 'DRAFT' | 'SENT' | 'DELIVERED' | 'READ';
  recipients: string; // JSON string of leader IDs
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

interface Leader {
  id: string;
  full_name: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  _count: {
    individuals: number;
  };
}

export default function MessagesPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    recipients: [] as string[]
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMessages();
      fetchLeaders();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data?.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchLeaders = async () => {
    try {
      const response = await fetch('/api/leaders', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setLeaders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leaders:', error);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.contentAr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">مسودة</Badge>;
      case 'SENT':
        return <Badge variant="default">مرسل</Badge>;
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">مستلم</Badge>;
      case 'READ':
        return <Badge variant="outline" className="bg-green-100 text-green-800">مقروء</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MANAGER_TO_LEADERS':
        return <Badge variant="default" className="bg-blue-600">من المدير للقادة</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleSendMessage = async () => {
    if (!composeForm.title || !composeForm.content) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const response = await fetch(
        '/api/messages',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: composeForm.title,
            titleAr: composeForm.titleAr || composeForm.title,
            content: composeForm.content,
            contentAr: composeForm.contentAr || composeForm.content,
            type: 'MANAGER_TO_LEADERS',
            recipients: JSON.stringify(composeForm.recipients)
          }),
        })
      );

      if (response.ok) {
        setShowCompose(false);
        setComposeForm({
          title: '',
          titleAr: '',
          content: '',
          contentAr: '',
          recipients: []
        });
        fetchMessages();
      } else {
        alert('فشل إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('حدث خطأ أثناء إرسال الرسالة');
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
                الرسائل الجماعية للقادة
              </h1>
            </div>
            
            {user?.role.name === 'MANAGER' && (
              <Button
                onClick={() => setShowCompose(true)}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <Send className="h-4 w-4" />
                <span>إرسال رسالة للقادة</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Compose Message Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Crown className="h-5 w-5 text-blue-600" />
                    <span>إرسال رسالة من المدير للقادة</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompose(false)}
                  >
                    ✕
                  </Button>
                </div>
                <CardDescription>
                  سيتم إرسال هذه الرسالة إلى جميع القادة في الحملة الانتخابية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">عنوان الرسالة (عربي)</label>
                    <Input
                      value={composeForm.titleAr}
                      onChange={(e) => setComposeForm({...composeForm, titleAr: e.target.value})}
                      placeholder="أدخل عنوان الرسالة باللغة العربية"
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">عنوان الرسالة (إنجليزي)</label>
                    <Input
                      value={composeForm.title}
                      onChange={(e) => setComposeForm({...composeForm, title: e.target.value})}
                      placeholder="Enter message title in English"
                      className="text-left"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">محتوى الرسالة (عربي)</label>
                    <Textarea
                      value={composeForm.contentAr}
                      onChange={(e) => setComposeForm({...composeForm, contentAr: e.target.value})}
                      placeholder="أدخل محتوى الرسالة باللغة العربية"
                      rows={4}
                      className="text-right"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">محتوى الرسالة (إنجليزي)</label>
                    <Textarea
                      value={composeForm.content}
                      onChange={(e) => setComposeForm({...composeForm, content: e.target.value})}
                      placeholder="Enter message content in English"
                      rows={4}
                      className="text-left"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">القادة المستلمون</label>
                    <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">تحديد الكل</span>
                        <input
                          type="checkbox"
                          checked={composeForm.recipients.length === leaders.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setComposeForm({
                                ...composeForm,
                                recipients: leaders.map(leader => leader.id)
                              });
                            } else {
                              setComposeForm({
                                ...composeForm,
                                recipients: []
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                      {leaders.map((leader) => (
                        <label key={leader.id} className="flex items-center justify-between space-x-2 space-x-reverse p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Users2 className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium">{leader.full_name}</div>
                              <div className="text-xs text-gray-500">{leader.user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Badge variant="outline" className="text-xs">
                              {leader._count.individuals} أفراد
                            </Badge>
                            <input
                              type="checkbox"
                              checked={composeForm.recipients.includes(leader.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setComposeForm({
                                    ...composeForm,
                                    recipients: [...composeForm.recipients, leader.id]
                                  });
                                } else {
                                  setComposeForm({
                                    ...composeForm,
                                    recipients: composeForm.recipients.filter(id => id !== leader.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      onClick={() => setShowCompose(false)}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={composeForm.recipients.length === 0}
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <Send className="h-4 w-4" />
                      <span>إرسال للقادة ({composeForm.recipients.length})</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <Crown className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              الرسائل الجماعية للقادة
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role.name === 'MANAGER' 
              ? 'إرسال رسائل جماعية من المدير إلى جميع قادة الحملة الانتخابية'
              : 'عرض الرسائل المرسلة من المدير'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي الرسائل
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {messages.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                عدد القادة
              </CardTitle>
              <Users2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {leaders.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                الرسائل المرسلة
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {messages.filter(m => m.status === 'SENT').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="بحث في الرسائل..."
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
            <option value="SENT">مرسل</option>
            <option value="DELIVERED">مستلم</option>
            <option value="READ">مقروء</option>
          </select>
        </div>

        {/* Messages List */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Crown className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-lg">{message.titleAr || message.title}</CardTitle>
                      </div>
                      <div className="flex gap-2 mt-2">
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
                  <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-right">
                      {message.contentAr || message.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Users2 className="h-4 w-4 ml-2" />
                        <span>
                          {(() => {
                            try {
                              const parsed = JSON.parse(message.recipients);
                              if (Array.isArray(parsed)) {
                                return `${parsed.length} قادة`;
                              }
                              return '1 قائد';
                            } catch {
                              if (typeof message.recipients === 'string') {
                                const recipients = message.recipients.split(',').filter(Boolean);
                                return `${recipients.length} قادة`;
                              }
                              return '1 قائد';
                            }
                          })()}
                        </span>
                      </div>
                      
                      {message.sender && (
                        <span>المرسل: {message.sender.name}</span>
                      )}
                    </div>
                    
                    {message.sentAt && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 ml-2" />
                        <span>أرسلت في: {new Date(message.sentAt).toLocaleString('ar-SA')}</span>
                      </div>
                    )}
                    
                    {message.readAt && (
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 ml-2" />
                        <span>قُرأت في: {new Date(message.readAt).toLocaleString('ar-SA')}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/messages/${message.id}`)}
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!dataLoading && filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد رسائل
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'لا توجد رسائل تطابق معايير البحث'
                : 'ابدأ بإرسال رسالة جديدة'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button onClick={() => setShowCompose(true)}>
                إرسال رسالة جديدة
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
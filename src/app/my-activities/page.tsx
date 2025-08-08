'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Target, 
  Bell, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowLeft,
  Calendar,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  status: string;
  priority: string;
  dueDate?: string;
  campaign: {
    id: string;
    title: string;
    titleAr: string;
  };
  area?: {
    id: string;
    name: string;
    nameAr: string;
  };
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  status: string;
  sentAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

interface ActivityData {
  leader: {
    id: string;
    name: string;
  };
  tasks: Task[];
  notifications: Notification[];
  messages: Message[];
  activityLogs: ActivityLog[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    unreadNotifications: number;
    unreadMessages: number;
  };
}

export default function MyActivities() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ActivityData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyActivities();
    }
  }, [isAuthenticated, user]);

  const fetchMyActivities = async () => {
    try {
      const response = await fetch('/api/my-activities', { credentials: 'include' });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else if (response.status === 403) {
        // User is not a leader, redirect to dashboard
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching my activities:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'task' | 'message' = 'task') => {
    if (type === 'task') {
      const taskStatusConfig = {
        PENDING: { variant: 'secondary' as const, label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800' },
        IN_PROGRESS: { variant: 'default' as const, label: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-800' },
        COMPLETED: { variant: 'default' as const, label: 'مكتمل', className: 'bg-green-100 text-green-800' },
        CANCELLED: { variant: 'destructive' as const, label: 'ملغي', className: 'bg-red-100 text-red-800' },
      };
      
      const config = taskStatusConfig[status as keyof typeof taskStatusConfig] || taskStatusConfig.PENDING;
      
      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      );
    } else {
      const messageStatusConfig = {
        DRAFT: { variant: 'secondary' as const, label: 'مسودة', className: 'bg-gray-100 text-gray-800' },
        SCHEDULED: { variant: 'default' as const, label: 'مجدول', className: 'bg-blue-100 text-blue-800' },
        SENT: { variant: 'default' as const, label: 'مرسل', className: 'bg-green-100 text-green-800' },
        DELIVERED: { variant: 'default' as const, label: 'تم التسليم', className: 'bg-purple-100 text-purple-800' },
        FAILED: { variant: 'destructive' as const, label: 'فشل', className: 'bg-red-100 text-red-800' },
      };
      
      const config = messageStatusConfig[status as keyof typeof messageStatusConfig] || messageStatusConfig.DRAFT;
      
      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      );
    }
  };

  const getNotificationBadge = (type: string) => {
    const typeConfig = {
      INFO: { variant: 'default' as const, label: 'معلومات', className: 'bg-blue-100 text-blue-800' },
      WARNING: { variant: 'default' as const, label: 'تحذير', className: 'bg-orange-100 text-orange-800' },
      ERROR: { variant: 'destructive' as const, label: 'خطأ', className: 'bg-red-100 text-red-800' },
      SUCCESS: { variant: 'default' as const, label: 'نجاح', className: 'bg-green-100 text-green-800' },
      TASK_ASSIGNED: { variant: 'default' as const, label: 'مهمة جديدة', className: 'bg-purple-100 text-purple-800' },
      DEADLINE_REMINDER: { variant: 'default' as const, label: 'تذكير', className: 'bg-yellow-100 text-yellow-800' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.INFO;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للرئيسية
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Activity className="h-5 w-5" />
                <span>نشاطاتي</span>
              </CardTitle>
              <CardDescription>
                عرض نشاطاتي ومهامي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Stats Cards */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{data.stats.totalTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي المهام</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{data.stats.completedTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مهام مكتملة</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{data.stats.pendingTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مهام قيد الانتظار</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-4 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{data.stats.unreadNotifications}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إشعارات غير مقروءة</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-600">{data.stats.unreadMessages}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">رسائل غير مقروءة</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks" className="flex items-center space-x-2 space-x-reverse">
                <Target className="h-4 w-4" />
                <span>مهامي</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 space-x-reverse">
                <Bell className="h-4 w-4" />
                <span>الإشعارات</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center space-x-2 space-x-reverse">
                <MessageSquare className="h-4 w-4" />
                <span>الرسائل</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center space-x-2 space-x-reverse">
                <Activity className="h-4 w-4" />
                <span>النشاطات</span>
              </TabsTrigger>
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Target className="h-5 w-5" />
                    <span>مهامي ({data?.tasks.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    عرض جميع المهام المسندة إلي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.tasks.length ? (
                    <ScrollArea className="h-[500px] w-full">
                      <div className="space-y-4">
                        {data.tasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {task.titleAr}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {task.descriptionAr}
                                </p>
                                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(task.createdAt).toLocaleDateString('ar-SA')}</span>
                                  </div>
                                  {task.dueDate && (
                                    <div className="flex items-center space-x-1 space-x-reverse">
                                      <Clock className="h-3 w-3" />
                                      <span>موعد: {new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                  )}
                                  {task.area && (
                                    <div className="flex items-center space-x-1 space-x-reverse">
                                      <MapPin className="h-3 w-3" />
                                      <span>{task.area.nameAr}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getStatusBadge(task.status, 'task')}
                                <Badge variant="outline" className="text-xs">
                                  {task.campaign.titleAr}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">لا توجد مهام مسندة إليك</p>
                      <p className="text-sm">سيتم عرض المهام هنا عند إسنادها إليك</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Bell className="h-5 w-5" />
                    <span>الإشعارات ({data?.notifications.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    عرض جميع الإشعارات الواردة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.notifications.length ? (
                    <ScrollArea className="h-[500px] w-full">
                      <div className="space-y-3">
                        {data.notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow ${
                              !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {notification.titleAr}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.messageAr}
                                </p>
                                <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                                  <span>{new Date(notification.createdAt).toLocaleString('ar-SA')}</span>
                                  {!notification.isRead && (
                                    <Badge variant="default" className="bg-blue-500 text-white text-xs">
                                      جديد
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getNotificationBadge(notification.type)}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">لا توجد إشعارات</p>
                      <p className="text-sm">سيتم عرض الإشعارات هنا عند استلامها</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <MessageSquare className="h-5 w-5" />
                    <span>الرسائل ({data?.messages.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    عرض الرسائل الواردة من المدير
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.messages.length ? (
                    <ScrollArea className="h-[500px] w-full">
                      <div className="space-y-4">
                        {data.messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {message.titleAr}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {message.contentAr}
                                </p>
                                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <span>من: {message.sender.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(message.sentAt).toLocaleString('ar-SA')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getStatusBadge(message.status, 'message')}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">لا توجد رسائل</p>
                      <p className="text-sm">سيتم عرض الرسائل هنا عند استلامها</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Activity className="h-5 w-5" />
                    <span>سجل النشاطات ({data?.activityLogs.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    عرض سجل نشاطاتك الأخيرة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.activityLogs.length ? (
                    <ScrollArea className="h-[500px] w-full">
                      <div className="space-y-3">
                        {data.activityLogs.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {log.action}
                                </h3>
                                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                                  <span>النوع: {log.entityType}</span>
                                  <span>المعرف: {log.entityId}</span>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(log.createdAt).toLocaleString('ar-SA')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">لا توجد نشاطات</p>
                      <p className="text-sm">سيتم عرض نشاطاتك هنا عند قيامك بأي إجراء</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
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
  Bell, 
  Target, 
  FileText,
  Heart,
  MessageCircle,
  Share,
  Clock,
  CheckCircle,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
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

interface Task {
  id: string;
  title: string;
  titleAr: string;
  status: string;
  priority: string;
  dueDate?: string;
  campaign: {
    id: string;
    title: string;
    titleAr: string;
  };
  createdAt: string;
}

interface PostInteraction {
  id: string;
  type: string;
  content?: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    titleAr: string;
    type: string;
    createdAt: string;
  };
}

interface MyActivityData {
  activityLogs: ActivityLog[];
  notifications: Notification[];
  tasks: Task[];
  postInteractions: PostInteraction[];
  stats: {
    totalActivities: number;
    unreadNotifications: number;
    totalTasks: number;
    completedTasks: number;
    totalInteractions: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };
}

export default function MyActivity() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MyActivityData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyActivity();
    }
  }, [isAuthenticated, user]);

  const fetchMyActivity = async () => {
    try {
      const response = await fetch('/api/my-activity', { credentials: 'include' });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching my activity:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { variant: 'default' as const, label: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { variant: 'default' as const, label: 'مكتمل', className: 'bg-green-100 text-green-800' },
      CANCELLED: { variant: 'destructive' as const, label: 'ملغي', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'COMMENT':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'SHARE':
        return <Share className="h-4 w-4 text-green-500" />;
      case 'VIEW':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInteractionLabel = (type: string) => {
    switch (type) {
      case 'LIKE':
        return 'إعجاب';
      case 'COMMENT':
        return 'تعليق';
      case 'SHARE':
        return 'مشاركة';
      case 'VIEW':
        return 'مشاهدة';
      default:
        return 'تفاعل';
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
                <span>نشاطي</span>
              </CardTitle>
              <CardDescription>
                عرض سجل نشاطاتي
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{data.stats.totalActivities}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي النشاطات</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{data.stats.likesCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إعجابات</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{data.stats.commentsCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">تعليقات</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <CardContent className="p-4 text-center">
                <Share className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-600">{data.stats.sharesCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مشاركات</div>
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
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity" className="flex items-center space-x-2 space-x-reverse">
                <Activity className="h-4 w-4" />
                <span>نشاطي</span>
              </TabsTrigger>
              <TabsTrigger value="interactions" className="flex items-center space-x-2 space-x-reverse">
                <FileText className="h-4 w-4" />
                <span>التفاعلات</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 space-x-reverse">
                <Bell className="h-4 w-4" />
                <span>الإشعارات</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center space-x-2 space-x-reverse">
                <Target className="h-4 w-4" />
                <span>مهامي</span>
              </TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Activity className="h-5 w-5" />
                    <span>سجل نشاطاتي ({data?.activityLogs.length || 0})</span>
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

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <FileText className="h-5 w-5" />
                    <span>التفاعلات مع المنشورات ({data?.postInteractions.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    عرض تفاعلاتك مع المنشورات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.postInteractions.length ? (
                    <ScrollArea className="h-[500px] w-full">
                      <div className="space-y-4">
                        {data.postInteractions.map((interaction, index) => (
                          <motion.div
                            key={interaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                  {getInteractionIcon(interaction.type)}
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {getInteractionLabel(interaction.type)}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  على منشور: {interaction.post.titleAr}
                                </p>
                                {interaction.content && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                                    "{interaction.content}"
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(interaction.createdAt).toLocaleString('ar-SA')}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {interaction.post.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">لا توجد تفاعلات</p>
                      <p className="text-sm">ابدأ بالتفاعل مع المنشورات ليظهر نشاطك هنا</p>
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
                    عرض جميع الإشعارات الخاصة بك
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

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Target className="h-5 w-5" />
                    <span>مهامي ({data?.tasks.length || 0})</span>
                  </CardTitle>
                  <CardDescription>
                    عرض المهام المسندة إليك
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
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getStatusBadge(task.status)}
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
                      <p className="text-lg mb-2">لا توجد مهام</p>
                      <p className="text-sm">سيتم عرض المهام هنا عند إسنادها إليك</p>
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
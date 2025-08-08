'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ActivityLogsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivityLogs();
    }
  }, [isAuthenticated]);

  const fetchActivityLogs = async () => {
    try {
      // Return empty array - no activity logs until activities occur
      const logs: ActivityLog[] = [];

      setLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CREATE':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'UPDATE':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'DELETE':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'تسجيل الدخول';
      case 'CREATE':
        return 'إنشاء';
      case 'UPDATE':
        return 'تحديث';
      case 'DELETE':
        return 'حذف';
      default:
        return action;
    }
  };

  const getEntityTypeText = (entityType: string) => {
    switch (entityType) {
      case 'User':
        return 'مستخدم';
      case 'Leader':
        return 'قائد';
      case 'Individual':
        return 'فرد';
      case 'Post':
        return 'منشور';
      case 'Task':
        return 'مهمة';
      default:
        return entityType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-lg font-medium"
          >
            جاري التحميل...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                رجوع
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ح ع</span>
              </div>
              <div className="mr-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  سجل النشاطات
                </h1>
                <p className="text-sm text-gray-400">
                  مكتب النائب علي الحميداوي
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4 space-x-reverse"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {user?.name}
                </p>
                <Badge variant="secondary" className="text-xs bg-red-600 text-white">
                  مدير
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    سجل نشاطات النظام
                  </h2>
                  <p className="text-gray-400">
                    عرض جميع نشاطات النظام والتغييرات التي تم إجراؤها
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {filteredLogs.length}
                  </p>
                  <p className="text-sm text-gray-400">
                    إجمالي النشاطات
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-700">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث بالنشاط، الكيان، أو المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <Button variant="outline" className="border-gray-600 hover:bg-gray-700 text-white">
                <Filter className="h-4 w-4 ml-2" />
                فلترة
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Activity Logs */}
        {loadingLogs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-400" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-gray-800 shadow-xl border border-gray-700 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {getActionIcon(log.action)}
                        <div>
                          <CardTitle className="text-lg font-semibold text-white">
                            {getActionText(log.action)} - {getEntityTypeText(log.entityType)}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-400">
                            بواسطة {log.user.name}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(log.createdAt).toLocaleDateString('ar-SA')}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{new Date(log.createdAt).toLocaleTimeString('ar-SA')}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">عنوان IP</p>
                        <p className="text-white font-mono">{log.ipAddress}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">معرف الكيان</p>
                        <p className="text-white font-mono">{log.entityId}</p>
                      </div>
                    </div>
                    {(log.oldValues || log.newValues) && (
                      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                        <p className="text-gray-400 mb-2">تفاصيل التغيير:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {log.oldValues && (
                            <div>
                              <p className="text-red-400 text-xs mb-1">القيم القديمة:</p>
                              <pre className="text-red-300 text-xs bg-red-900/20 p-2 rounded">
                                {JSON.stringify(log.oldValues, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValues && (
                            <div>
                              <p className="text-green-400 text-xs mb-1">القيم الجديدة:</p>
                              <pre className="text-green-300 text-xs bg-green-900/20 p-2 rounded">
                                {JSON.stringify(log.newValues, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredLogs.length === 0 && !loadingLogs && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              لا يوجد نشاطات
            </h3>
            <p className="text-gray-400">
              {searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لم يتم تسجيل أي نشاطات بعد'}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
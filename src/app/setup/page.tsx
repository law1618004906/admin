'use client';

import { useState, useEffect } from 'react';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Settings,
  User,
  Shield
} from 'lucide-react';

interface SetupStatus {
  success: boolean;
  message: string;
  user?: {
    email: string;
    name: string;
    role: string;
  };
  campaigns?: number;
  needsSetup?: boolean;
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/setup/seed', { credentials: 'include' });
      const data: SetupStatus = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to check setup status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const performSetup = async () => {
    setIsSettingUp(true);
    try {
      const response = await fetch(
        '/api/setup/seed',
        withCsrf({
          method: 'POST',
          credentials: 'include',
        })
      );
      
      const data: SetupStatus = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Failed to perform setup'
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Settings className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إعداد النظام
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            قم بإعداد النظام وإنشاء المستخدم الافتراضي
          </p>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-lg border ${
            status.success 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {status.success ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <span>{status.message}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                حالة النظام
              </CardTitle>
              <CardDescription>
                حالة الإعداد الحالية للنظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : status ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">الحالة العامة:</span>
                    <Badge variant={status.success ? "default" : "destructive"}>
                      {status.success ? "جاهز" : "غير جاهز"}
                    </Badge>
                  </div>
                  
                  {status.user && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          <strong>المستخدم:</strong> {status.user.name} ({status.user.email})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          <strong>الدور:</strong> {status.user.role}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {status.campaigns !== undefined && (
                    <div className="text-sm">
                      <strong>عدد الحملات:</strong> {status.campaigns}
                    </div>
                  )}
                  
                  <Button
                    onClick={checkSetupStatus}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    تحديث الحالة
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  غير قادر على جلب حالة النظام
                </p>
              )}
            </CardContent>
          </Card>

          {/* Setup Actions */}
          {status?.needsSetup && (
            <Card>
              <CardHeader>
                <CardTitle>إعداد النظام</CardTitle>
                <CardDescription>
                  النظام يحتاج إلى الإعداد الأولي. اضغط للبدء.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={performSetup}
                  disabled={isSettingUp}
                  className="w-full"
                >
                  {isSettingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  إعداد النظام
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Login Information */}
          {status?.success && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات تسجيل الدخول</CardTitle>
                <CardDescription>
                  استخدم هذه المعلومات لتسجيل الدخول إلى النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      البريد الإلكتروني
                    </div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">
                      admin@hamidawi.com
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      كلمة المرور
                    </div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">
                      admin123
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={() => window.location.href = '/login'}
                      variant="outline"
                    >
                      الانتقال إلى صفحة تسجيل الدخول
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>الخطوات التالية</CardTitle>
              <CardDescription>
                بعد إعداد النظام، يمكنك البدء في استخدامه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                  <p>تسجيل الدخول إلى النظام باستخدام المعلومات أعلاه</p>
                </div>
                
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                  <p>استكشاف لوحة التحكم وإدارة المحتوى</p>
                </div>
                
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                  <p>إعداد بوت التليجرام للتحكم من الجوال</p>
                </div>
                
                <div className="flex items-start space-x-2 space-x-reverse">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                  <p>إنشاء حملات ومنشورات ورسائل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
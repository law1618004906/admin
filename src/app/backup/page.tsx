'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw, Database, Clock, Users, FileCode, BarChart3, Shield } from 'lucide-react';

interface BackupData {
  fileName: string;
  timestamp: string;
  type: string;
  totalRecords: {
    users: number;
    persons: number;
    leaders: number;
    areas: number;
    activities: number;
  };
  status: string;
}

export default function BackupPage() {
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>('');

  const createBackup = async (type: 'manual' | 'auto' = 'manual') => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();
      
      if (result.success) {
        setBackupData(result.data);
        setLastBackup(new Date().toISOString());
      } else {
        throw new Error(result.message || 'فشل في إنشاء النسخة الاحتياطي');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      alert('فشل في إنشاء النسخة الاحتياطي: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (fileName: string) => {
    try {
      const response = await fetch(`/api/backup?file=${fileName}`);
      const result = await response.json();
      
      if (result.success) {
        // تنزيل البيانات كملف JSON
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = fileName;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else {
        throw new Error(result.error || 'فشل في تنزيل النسخة الاحتياطي');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('فشل في تنزيل النسخة الاحتياطي: ' + (error as Error).message);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  useEffect(() => {
    // تحميل آخر نسخة احتياطي عند فتح الصفحة
    // يمكن إضافة API endpoint لجلب معلومات آخر نسخة احتياطي
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">النسخ الاحتياطي والمراقبة</h1>
          <p className="text-gray-600">إدارة النسخ الاحتياطي ومراقبة الأداء</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => createBackup('manual')} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Database className={`h-4 w-4 ml-2 ${loading ? 'animate-pulse' : ''}`} />
            إنشاء نسخة احتياطي
          </Button>
        </div>
      </div>

      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
          <TabsTrigger value="azure">Azure Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          {/* معلومات النسخة الاحتياطي الحالية */}
          {backupData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  آخر نسخة احتياطي
                </CardTitle>
                <CardDescription>
                  تم إنشاؤها في: {new Date(backupData.timestamp).toLocaleString('ar-SA')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{backupData.totalRecords.users}</div>
                    <div className="text-sm text-gray-600">المستخدمين</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{backupData.totalRecords.persons}</div>
                    <div className="text-sm text-gray-600">الأشخاص</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{backupData.totalRecords.leaders}</div>
                    <div className="text-sm text-gray-600">القيادات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{backupData.totalRecords.areas}</div>
                    <div className="text-sm text-gray-600">المناطق</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{backupData.totalRecords.activities}</div>
                    <div className="text-sm text-gray-600">الأنشطة</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={backupData.status === 'completed' ? 'default' : 'destructive'}>
                      {backupData.status === 'completed' ? 'مكتملة' : 'فشلت'}
                    </Badge>
                    <span className="text-sm text-gray-600">النوع: {backupData.type === 'manual' ? 'يدوي' : 'تلقائي'}</span>
                  </div>
                  <Button 
                    onClick={() => downloadBackup(backupData.fileName)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تنزيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* معلومات عامة عن النسخ الاحتياطي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">النسخ الاحتياطي التلقائي</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">يومياً</div>
                <p className="text-xs text-gray-600">
                  الساعة 2:00 ص (توقيت السعودية)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مدة الاحتفاظ</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">30 يوم</div>
                <p className="text-xs text-gray-600">
                  تنظيف تلقائي للنسخ القديمة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">آخر نسخة احتياطي</CardTitle>
                <RefreshCw className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {lastBackup ? new Date(lastBackup).toLocaleDateString('ar-SA') : 'لا توجد'}
                </div>
                <p className="text-xs text-gray-600">
                  {lastBackup ? new Date(lastBackup).toLocaleTimeString('ar-SA') : 'لم يتم إنشاء نسخة بعد'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  سجلات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  راقب سجلات التطبيق والأنشطة في الوقت الفعلي
                </p>
                <Button variant="outline" asChild>
                  <a href="/logs">عرض السجلات</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  إحصائيات الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  تحليل أداء التطبيق واستخدام الموارد
                </p>
                <Button variant="outline" disabled>
                  قريباً
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="azure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Azure Application Insights</CardTitle>
              <CardDescription>
                مراقبة التطبيق في Azure مع Instrumentation Key: 33dbc1cb-ae36-4255-80f6-b45ffada617b
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">المميزات المفعلة:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• تتبع الطلبات تلقائياً</li>
                    <li>• تتبع الأخطاء والاستثناءات</li>
                    <li>• مراقبة الأداء</li>
                    <li>• تتبع التبعيات</li>
                    <li>• سجلات مخصصة</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">روابط مفيدة:</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://portal.azure.com/#@/resource/subscriptions/fc084487-7b38-4db3-94f7-9e30e3884b5f/resourceGroups/end-rg/providers/microsoft.insights/components/end-admin-app-1754695871-insights"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        فتح Azure Portal
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://portal.azure.com/#@/resource/subscriptions/fc084487-7b38-4db3-94f7-9e30e3884b5f/resourceGroups/end-rg/providers/microsoft.insights/components/end-admin-app-1754695871-insights/logs"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        عرض السجلات
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

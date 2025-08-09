'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Info, AlertTriangle, Bug, RefreshCw, Trash2 } from 'lucide-react';

interface LogStats {
  totalLines: number;
  errorCount: number;
  warnCount: number;
}

interface LogResponse {
  logs: string[];
  count: number;
  timestamp: string;
}

const LogLevelIcon = ({ level }: { level: string }) => {
  switch (level.toLowerCase()) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'debug':
      return <Bug className="h-4 w-4 text-blue-500" />;
    default:
      return <Info className="h-4 w-4 text-green-500" />;
  }
};

const LogLine = ({ line }: { line: string }) => {
  // استخراج المعلومات من سطر الـ log
  const timestampMatch = line.match(/\[(.*?)\]/);
  const levelMatch = line.match(/\[([A-Z]+)\]/);
  const messageMatch = line.match(/\] (.+)/);

  const timestamp = timestampMatch ? timestampMatch[1] : '';
  const level = levelMatch ? levelMatch[1] : 'INFO';
  const message = messageMatch ? messageMatch[1] : line;

  const levelColors = {
    ERROR: 'bg-red-100 text-red-800 border-red-200',
    WARN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    INFO: 'bg-green-100 text-green-800 border-green-200',
    DEBUG: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className="flex items-start gap-2 p-2 border-b hover:bg-gray-50 text-sm">
      <LogLevelIcon level={level} />
      <Badge variant="outline" className={levelColors[level as keyof typeof levelColors] || levelColors.INFO}>
        {level}
      </Badge>
      <span className="text-gray-500 text-xs min-w-[120px]">
        {new Date(timestamp).toLocaleTimeString('ar-SA')}
      </span>
      <span className="flex-1 font-mono text-xs">{message}</span>
    </div>
  );
};

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<LogStats>({ totalLines: 0, errorCount: 0, warnCount: 0 });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchLogs = async (lines: number = 100) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/logs?type=recent&lines=${lines}`);
      const data: LogResponse = await response.json();
      setLogs(data.logs);
      setLastUpdate(data.timestamp);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/logs?type=stats');
      const data: LogStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const cleanLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs', { method: 'DELETE' });
      if (response.ok) {
        await fetchLogs();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to clean logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // تحديث تلقائي كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const errorLogs = logs.filter(log => log.includes('[ERROR]'));
  const warnLogs = logs.filter(log => log.includes('[WARN]'));
  const infoLogs = logs.filter(log => log.includes('[INFO]'));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">سجلات التطبيق</h1>
          <p className="text-gray-600">مراقبة وإدارة سجلات النظام</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => fetchLogs()} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button 
            onClick={cleanLogs} 
            disabled={loading}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            تنظيف السجلات القديمة
          </Button>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLines.toLocaleString('ar-SA')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأخطاء</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorCount.toLocaleString('ar-SA')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التحذيرات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnCount.toLocaleString('ar-SA')}</div>
          </CardContent>
        </Card>
      </div>

      {/* السجلات */}
      <Card>
        <CardHeader>
          <CardTitle>السجلات الحديثة</CardTitle>
          <CardDescription>
            آخر تحديث: {lastUpdate ? new Date(lastUpdate).toLocaleString('ar-SA') : 'غير محدد'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">الكل ({logs.length})</TabsTrigger>
              <TabsTrigger value="errors">أخطاء ({errorLogs.length})</TabsTrigger>
              <TabsTrigger value="warnings">تحذيرات ({warnLogs.length})</TabsTrigger>
              <TabsTrigger value="info">معلومات ({infoLogs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="max-h-96 overflow-y-auto border rounded">
                {logs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">لا توجد سجلات متاحة</div>
                ) : (
                  logs.map((log, index) => (
                    <LogLine key={index} line={log} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="errors" className="mt-4">
              <div className="max-h-96 overflow-y-auto border rounded">
                {errorLogs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">لا توجد أخطاء</div>
                ) : (
                  errorLogs.map((log, index) => (
                    <LogLine key={index} line={log} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="warnings" className="mt-4">
              <div className="max-h-96 overflow-y-auto border rounded">
                {warnLogs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">لا توجد تحذيرات</div>
                ) : (
                  warnLogs.map((log, index) => (
                    <LogLine key={index} line={log} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <div className="max-h-96 overflow-y-auto border rounded">
                {infoLogs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">لا توجد معلومات</div>
                ) : (
                  infoLogs.map((log, index) => (
                    <LogLine key={index} line={log} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Send,
  Bot,
  Webhook
} from 'lucide-react';

interface WebhookInfo {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    last_error_date?: number;
    last_error_message?: string;
  };
}

export default function TelegramSetupPage() {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Auto-detect webhook URL based on current domain
    const currentUrl = window.location.origin;
    setWebhookUrl(`${currentUrl}/api/telegram/webhook`);
    fetchWebhookInfo();
  }, []);

  const fetchWebhookInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/telegram/setup', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setWebhookInfo(data.webhookInfo);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to fetch webhook info');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error fetching webhook info');
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebhook = async () => {
    if (!webhookUrl) {
      setStatus('error');
      setMessage('Webhook URL is required');
      return;
    }

    setIsSettingWebhook(true);
    try {
      const response = await fetch(
        '/api/telegram/setup',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ webhookUrl }),
        })
      );

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Webhook set successfully!');
        fetchWebhookInfo(); // Refresh webhook info
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to set webhook');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error setting webhook');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const testBot = async () => {
    try {
      // Send a test message to verify bot is working
      const response = await fetch(
        '/api/telegram',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            chat_id: '5458432903',
            text: '🧪 *اختبار البوت*\n\nالبوت يعمل بنجاح!\nالوقت: ' + new Date().toLocaleString('ar-SA'),
            parse_mode: 'Markdown'
          }),
        })
      );

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Test message sent successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send test message');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error sending test message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إعداد بوت التليجرام
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            قم بإعداد webhook البوت لاستقبال الأوامر وإنشاء المحتوى مباشرة من التليجرام
          </p>
        </div>

        {/* Status Alert */}
        {status !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg border ${
            status === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Webhook Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="h-5 w-5 mr-2" />
                إعداد Webhook
              </CardTitle>
              <CardDescription>
                قم بإعداد webhook لاستقبال الرسائل من التليجرام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  رابط Webhook
                </label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/telegram/webhook"
                />
              </div>
              
              <Button
                onClick={setupWebhook}
                disabled={isSettingWebhook || !webhookUrl}
                className="w-full"
              >
                {isSettingWebhook ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                إعداد Webhook
              </Button>
            </CardContent>
          </Card>

          {/* Current Webhook Status */}
          <Card>
            <CardHeader>
              <CardTitle>حالة Webhook الحالية</CardTitle>
              <CardDescription>
                معلومات webhook الحالي
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : webhookInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">الحالة:</span>
                    <Badge variant={webhookInfo.ok ? "default" : "destructive"}>
                      {webhookInfo.ok ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">الرابط:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                      {webhookInfo.result.url || 'غير معين'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">التحديثات المعلقة:</span>
                    <span className="text-sm">{webhookInfo.result.pending_update_count}</span>
                  </div>
                  
                  {webhookInfo.result.last_error_message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <span className="text-sm font-medium text-red-800">آخر خطأ:</span>
                      <p className="text-sm text-red-600">
                        {webhookInfo.result.last_error_message}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={fetchWebhookInfo}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    تحديث الحالة
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  غير قادر على جلب معلومات webhook
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Bot */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              اختبار البوت
            </CardTitle>
            <CardDescription>
              أرسل رسالة اختبار للتحقق من أن البوت يعمل بشكل صحيح
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testBot}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              إرسال رسالة اختبار
            </Button>
          </CardContent>
        </Card>

        {/* Bot Commands */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>أوامر البوت المتاحة</CardTitle>
            <CardDescription>
              قائمة الأوامر التي يمكنك استخدامها مع البوت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <code className="text-sm font-mono">/start</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    بدء استخدام البوت
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <code className="text-sm font-mono">/create_post</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    إنشاء منشور جديد
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <code className="text-sm font-mono">/send_message</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    إرسال رسالة جديدة
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <code className="text-sm font-mono">/stats</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    عرض إحصائيات النظام
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
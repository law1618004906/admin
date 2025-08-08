'use client';

import { useState } from 'react';
import { withCsrf } from '@/lib/csrf-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Bot,
  RefreshCw,
  Play,
  MessageSquare,
  FileText,
  BarChart3
} from 'lucide-react';

export default function TelegramTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const showResult = (success: boolean, msg: string) => {
    setStatus(success ? 'success' : 'error');
    setMessage(msg);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test the API endpoint
      const response = await fetch(
        '/api/telegram-test',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            chat_id: '5458432903',
            text: '🔧 فحص الاتصال',
            parse_mode: 'Markdown'
          }),
        })
      );

      const data = await response.json();
      
      if (data.success) {
        showResult(true, '✅ الاتصال بالبوت يعمل بشكل ممتاز');
      } else {
        showResult(false, `❌ فشل الاتصال: ${data.error || data.details}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      showResult(false, '❌ فشل الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  const sendToTelegram = async (text: string) => {
    setIsLoading(true);
    try {
      console.log('Sending to Telegram:', text);
      const response = await fetch(
        '/api/telegram-test',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            chat_id: '5458432903',
            text: text,
            parse_mode: 'Markdown'
          }),
        })
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        showResult(true, '✅ تم الإرسال بنجاح');
      } else {
        showResult(false, `❌ فشل الإرسال: ${data.error || data.details}`);
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      showResult(false, '❌ خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const activateBot = () => {
    sendToTelegram('🤖 *تفعيل البوت*\n\nالبوت يعمل بنجاح!');
  };

  const sendTest = () => {
    sendToTelegram('🧪 *رسالة اختبار*\n\nالبوت شغال تمام!');
  };

  const checkUpdates = async () => {
    setIsLoading(true);
    try {
      // Check the polling system
      const response = await fetch('/api/telegram/polling', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        showResult(true, `✅ تم التحقق من التحديثات - تم معالجة ${data.processed} رسالة`);
      } else {
        showResult(false, '❌ فشل التحقق من التحديثات');
      }
    } catch (error) {
      console.error('Updates check error:', error);
      showResult(false, '❌ خطأ في التحقق من التحديثات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bot className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            بوت تلجرام البسيط
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            استخدم البوت بسهولة تامة - بالعربية فقط
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            @mktbalnbot
          </Badge>
        </div>

        {/* Status */}
        {status !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg border text-center ${
            status === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-center">
              {status === 'success' ? (
                <CheckCircle className="h-6 w-6 mr-2" />
              ) : (
                <XCircle className="h-6 w-6 mr-2" />
              )}
              <span className="text-lg">{message}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Play className="h-6 w-6 mr-2" />
                تفعيل البوت
              </CardTitle>
              <CardDescription>
                اضغط لتفعيل البوت وإرسال رسالة ترحيب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={activateBot}
                disabled={isLoading}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                تفعيل البوت
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Send className="h-6 w-6 mr-2" />
                رسالة اختبار
              </CardTitle>
              <CardDescription>
                أرسل رسالة اختبار للتحقق من البوت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={sendTest}
                disabled={isLoading}
                className="w-full h-12 text-lg"
                size="lg"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                إرسال رسالة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bot Commands */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-xl">أوامر البوت السهلة</CardTitle>
            <CardDescription className="text-center">
              كل الأوامر بالعربية فقط - سهلة وبسيطة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-bold text-lg mb-1">منشور</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  لإنشاء منشور جديد<br />
                  اكتب: منشور ثم العنوان ثم المحتوى
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-2xl mb-2">📬</div>
                <div className="font-bold text-lg mb-1">رسالة</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  لإرسال رسالة جديدة<br />
                  اكتب: رسالة ثم العنوان ثم المحتوى
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-lg mb-1">إحصائيات</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  لعرض إحصائيات النظام<br />
                  اكتب: إحصائيات
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <div className="text-2xl mb-2">❓</div>
                <div className="font-bold text-lg mb-1">مساعدة</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  لعرض المساعدة<br />
                  اكتب: مساعدة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-xl">أمثلة عملية</CardTitle>
            <CardDescription className="text-center">
              جرب هذه الأمثلة مباشرة في البوت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-bold mb-2">📝 مثال إنشاء منشور:</div>
                <div className="text-sm font-mono bg-white dark:bg-gray-700 p-2 rounded">
                  منشور<br />
                  إعلان مهم<br />
                  اجتماع يوم الأحد الساعة 10 صباحاً
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-bold mb-2">📬 مثال إرسال رسالة:</div>
                <div className="text-sm font-mono bg-white dark:bg-gray-700 p-2 rounded">
                  رسالة<br />
                  تذكير مهم<br />
                  لا تنسى الاجتماع غداً
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 mr-2" />
              فحص النظام
            </CardTitle>
            <CardDescription className="text-center">
              تحقق من حالة النظام والبوت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={testConnection}
                disabled={isLoading}
                className="h-12"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                فحص الاتصال
              </Button>
              
              <Button
                onClick={checkUpdates}
                disabled={isLoading}
                className="h-12"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                التحقق من التحديثات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold mb-4">طريقة الاستخدام</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>1. اذهب إلى بوت تلجرام: <strong>@mktbalnbot</strong></div>
            <div>2. اضغط على "تفعيل البوت" في الأعلى</div>
            <div>3. استخدم الأوامر السهلة المذكورة أعلاه</div>
            <div>4. لا حاجة لأي أوامر إنجليزية معقدة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
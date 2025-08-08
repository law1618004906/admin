'use client';

import { useState, Suspense } from 'react';
import { withCsrf } from '@/lib/csrf-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function LoginClient() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        '/api/auth/login',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('تم تسجيل الدخول بنجاح! سيتم تحويلك للوحة التحكم...');
        toast({ title: 'تم تسجيل الدخول', description: 'مرحبًا بعودتك.' });
        // في بيئات التطوير فقط: خزّن التوكن احتياطياً في localStorage لدعم البروكسي
        try {
          if (process.env.NODE_ENV !== 'production' && data?.token) {
            localStorage.setItem('auth_token', data.token);
          }
        } catch {}
        setTimeout(() => {
          const returnTo = searchParams.get('returnTo') || '/';
          router.replace(returnTo);
        }, 800);
      } else {
        const msg = data.error || 'فشل تسجيل الدخول';
        setError(msg);
        toast({ title: 'تعذّر تسجيل الدخول', description: msg, variant: 'destructive' });
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      toast({ title: 'مشكلة اتصال', description: 'تعذّر الوصول إلى الخادم. حاول مجددًا.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800 border border-gray-700 shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold tracking-widest">ح ع</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold text-white mb-1">
            نظام إدارة مكتب النائب
          </CardTitle>
          <CardDescription className="text-gray-300 text-base font-medium">
            منصة إلكترونية لإدارة الحملة الانتخابية للنائب علي الحميداوي
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} autoComplete="on" className="mt-2">
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-900 border-red-700">
                <AlertDescription className="text-red-100 text-sm font-bold">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-900 border-green-700 mt-2">
                <AlertDescription className="text-green-100 text-sm font-bold">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1 text-right">
              <Label htmlFor="email" className="text-gray-200 font-semibold">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@hamidawi.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="username"
                className="text-right bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1 text-right">
              <Label htmlFor="password" className="text-gray-200 font-semibold">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyUp={(e) => setCapsOn((e as unknown as KeyboardEvent).getModifierState?.('CapsLock') ?? false)}
                  required
                  autoComplete="current-password"
                  className="text-right bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 left-2 flex items-center text-gray-300 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsOn && (
                <div className="flex items-center gap-2 text-amber-300 text-xs mt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  تنبيه: زر الحروف الكبيرة (Caps Lock) مفعّل
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg font-bold tracking-wide py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
          <div className="text-white/80">جاري التحميل...</div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

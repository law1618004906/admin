'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* Main background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/background.png')"
          }}
        ></div>
        
        {/* Overlay for better contrast and readability */}
                {/* Overlay for better contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/70"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Official Header */}
          <div className="text-center mb-8">
            {/* Iraqi Eagle Emblem */}
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <img 
                src="/shar1.png" 
                alt="شعار جمهورية العراق"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Official Text */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-amber-400 mb-2 tracking-wide">
                جمهورية العراق
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3"></div>
              
              {/* شعار "الله أكبر" */}
              <div className="text-center mb-3">
                <p className="text-amber-300 text-lg font-bold tracking-widest">
                  الله أكبر
                </p>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mt-1"></div>
              </div>
              
              <h2 className="text-lg font-semibold text-amber-300 mb-1">
                مكتب النائب
              </h2>
              <h3 className="text-xl font-bold text-white">
                علي جاسم الحميداوي
              </h3>
            </div>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-amber-500/20 backdrop-blur-sm">
                    <Lock className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  تسجيل الدخول
                </h4>
                <p className="text-white/70 text-sm">
                  نظام إدارة القادة والأفراد
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    اسم المستخدم
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-amber-400 focus:ring-amber-400 text-right"
                  />
                </div>
                
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:border-amber-400 focus:ring-amber-400 text-right pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جاري التحقق...
                    </div>
                  ) : (
                    'دخول'
                  )}
                </Button>
              </form>

              {/* Footer info */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-center text-white/60 text-xs">
                  نظام آمن ومحمي
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional governmental styling */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-white/50 text-xs">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/30"></div>
              <span>مكتب النائب علي جاسم الحميداوي</span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 opacity-20">
        <div className="w-16 h-16 border border-amber-400/30 rounded-full"></div>
      </div>
      <div className="absolute bottom-4 right-4 opacity-20">
        <div className="w-12 h-12 border border-amber-400/30 rounded-full"></div>
      </div>
      <div className="absolute top-1/4 right-8 opacity-10">
        <div className="w-20 h-20 border border-white/20 rotate-45"></div>
      </div>
    </div>
  );
}
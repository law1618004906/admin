'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
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
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "كلمة المرور غير صحيحة",
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
      {/* Background with Iraqi flag gradient and pattern */}
      <div className="absolute inset-0">
        {/* Iraqi flag inspired gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-white to-black"></div>
        
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/60"></div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <g fill="currentColor">
                  <polygon points="50,0 100,50 50,100 0,50" opacity="0.3"/>
                  <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" className="text-amber-400"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Official Header */}
          <div className="text-center mb-8">
            {/* Iraqi Eagle (Saladin's Eagle) - الشعار الحقيقي لجمهورية العراق */}
            <div className="relative mx-auto mb-6 w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl opacity-20"></div>
              <svg 
                className="relative z-10 w-20 h-20 text-amber-400" 
                viewBox="0 0 200 200" 
                fill="currentColor"
              >
                {/* عقاب صلاح الدين الأيوبي - الشعار الرسمي */}
                {/* الجسم الرئيسي للعقاب */}
                <path d="M100 40 C90 35, 80 40, 75 50 L75 70 C70 75, 65 80, 65 90 C65 100, 70 110, 75 120 L75 150 C75 160, 85 170, 100 170 C115 170, 125 160, 125 150 L125 120 C130 110, 135 100, 135 90 C135 80, 130 75, 125 70 L125 50 C120 40, 110 35, 100 40 Z" stroke="currentColor" strokeWidth="2"/>
                
                {/* الأجنحة المفرودة */}
                <path d="M65 90 C50 85, 35 90, 25 100 C20 105, 25 110, 35 108 C45 106, 55 100, 65 95 Z"/>
                <path d="M135 90 C150 85, 165 90, 175 100 C180 105, 175 110, 165 108 C155 106, 145 100, 135 95 Z"/>
                
                {/* الجناح الأيسر العلوي */}
                <path d="M75 70 C60 65, 45 70, 35 80 C30 85, 35 90, 45 88 C55 86, 65 80, 75 75 Z"/>
                
                {/* الجناح الأيمن العلوي */}
                <path d="M125 70 C140 65, 155 70, 165 80 C170 85, 165 90, 155 88 C145 86, 135 80, 125 75 Z"/>
                
                {/* العينان */}
                <circle cx="90" cy="60" r="4" className="text-red-600" fill="currentColor"/>
                <circle cx="110" cy="60" r="4" className="text-red-600" fill="currentColor"/>
                
                {/* المنقار */}
                <path d="M100 70 L95 80 L100 75 L105 80 Z" className="text-yellow-600" fill="currentColor"/>
                
                {/* الذيل */}
                <path d="M85 150 L80 170 L90 165 L100 170 L110 165 L120 170 L115 150" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                
                {/* المخالب */}
                <path d="M85 165 L82 175 M90 167 L87 177 M95 168 L92 178" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M105 168 L108 178 M110 167 L113 177 M115 165 L118 175" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                
                {/* النص العربي داخل الشعار */}
                <text x="100" y="130" textAnchor="middle" className="text-[8px] font-bold fill-amber-300">
                  الله أكبر
                </text>
                
                {/* الزخرفة الإسلامية */}
                <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
              </svg>
            </div>

            {/* Official Text */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-amber-400 mb-2 tracking-wide">
                جمهورية العراق
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-3"></div>
              <h2 className="text-lg font-semibold text-amber-300 mb-1">
                مكتب النائب
              </h2>
              <h3 className="text-xl font-bold text-white">
                علي الحميداوي
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
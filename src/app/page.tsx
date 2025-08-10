'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, UserPlus } from 'lucide-react';
import LeaderPieChart from '@/components/LeaderPieChart';

// نوع إحصائيات اللوحة
type DashboardStats = {
  totalLeaders: number;
  totalPersons: number;
  totalVotes: number;
  leadersDistribution?: { leaderId: number | null; leaderName: string; count: number }[];
};

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // حالة الرسم
  const [chartLoading, setChartLoading] = useState(true);
  const [chartErr, setChartErr] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; __percent?: number }[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setChartLoading(true);
    
    fetch('/api/dashboard/stats', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as DashboardStats;
        if (!mounted) return;
        
        setStats({
          totalLeaders: json.totalLeaders || 0,
          totalPersons: json.totalPersons || 0,
          totalVotes: json.totalVotes || 0,
          leadersDistribution: json.leadersDistribution || []
        });

        // إعداد بيانات الرسم البياني
        if (json.leadersDistribution) {
          const chartData = json.leadersDistribution.map((item) => ({
            name: item.leaderName || 'غير محدد',
            value: item.count,
          }));
          setChartData(chartData);
        }
        setLoading(false);
        setChartLoading(false);
      })
      .catch((error) => {
        console.error('خطأ في تحميل الإحصائيات:', error);
        if (!mounted) return;
        setErr('فشل في تحميل الإحصائيات');
        setChartErr('فشل في تحميل بيانات الرسم البياني');
        setLoading(false);
        setChartLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">
            نظام إدارة القادة والأفراد
          </h1>
          <p className="text-purple-200">
            لوحة المعلومات والإحصائيات
          </p>
        </div>

        {/* Stats Cards */}
        {err ? (
          <Card className="mb-8 bg-purple-800/20 border-purple-600/30">
            <CardContent className="p-6">
              <div className="text-center text-red-400">
                <p className="font-semibold mb-2">خطأ في التحميل</p>
                <p className="text-sm">{err}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-purple-800/20 border-purple-600/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-400">إجمالي القادة</CardTitle>
                <Users className="h-4 w-4 text-amber-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalLeaders || 0}</div>
                <p className="text-xs text-purple-200">
                  عدد القادة المسجلين في النظام
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-800/20 border-purple-600/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-400">إجمالي الأفراد</CardTitle>
                <UserPlus className="h-4 w-4 text-amber-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalPersons || 0}</div>
                <p className="text-xs text-purple-200">
                  عدد الأفراد المسجلين في النظام
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-800/20 border-purple-600/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-400">إجمالي الأصوات</CardTitle>
                <Users className="h-4 w-4 text-amber-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalVotes || 0}</div>
                <p className="text-xs text-purple-200">
                  مجموع الأصوات لجميع القادة والأفراد
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-purple-800/20 border-purple-600/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-400">توزيع الأفراد حسب القادة</CardTitle>
              <CardDescription className="text-purple-200">
                عرض توزيع الأفراد على القادة المختلفين
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                </div>
              ) : chartErr ? (
                <div className="text-center text-red-400 h-64 flex items-center justify-center">
                  <p>{chartErr}</p>
                </div>
              ) : (
                <LeaderPieChart data={chartData} />
              )}
            </CardContent>
          </Card>

          <Card className="bg-purple-800/20 border-purple-600/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-400">الإجراءات السريعة</CardTitle>
              <CardDescription className="text-purple-200">
                الوصول السريع للوظائف الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/leaders">
                <Button className="w-full justify-start bg-purple-700 hover:bg-purple-600 text-white border-purple-600">
                  <Users className="mr-2 h-4 w-4 text-amber-300" />
                  إدارة القادة
                </Button>
              </Link>
              <Link href="/individuals">
                <Button className="w-full justify-start bg-purple-700 hover:bg-purple-600 text-white border-purple-600">
                  <UserPlus className="mr-2 h-4 w-4 text-amber-300" />
                  إدارة الأفراد
                </Button>
              </Link>
              <Link href="/leaders-tree">
                <Button className="w-full justify-start bg-purple-700 hover:bg-purple-600 text-white border-purple-600">
                  <Users className="mr-2 h-4 w-4 text-amber-300" />
                  شجرة القادة
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

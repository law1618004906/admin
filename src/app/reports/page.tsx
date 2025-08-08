"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const { has, loading: permsLoading } = usePermissions();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || permsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const allowed = has("reports.read");

  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" /> غير مصرح لك
            </CardTitle>
            <CardDescription>لا تملك صلاحية عرض هذه الصفحة (reports.read).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")}>العودة للرئيسية <Home className="h-4 w-4 mr-2" /></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التقارير</CardTitle>
          <CardDescription>مساحة مبدئية لعرض التقارير ولوحات المتابعة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">سيتم إضافة الجداول والفلترة لاحقًا.</div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { withCsrf } from "@/lib/csrf-client";
import PermissionGuard from "@/components/custom/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Loader2, Shield, Home } from "lucide-react";

interface Role {
  id: string;
  name: string;
  nameAr: string;
  permissions: string[]; // API يطبيعها كمصفوفة
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

export default function RolesPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const { has } = usePermissions();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [description, setDescription] = useState(""); // محجوز مستقبلاً
  const [permissionsCsv, setPermissionsCsv] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["roles"],
    enabled: !!isAuthenticated,
    queryFn: async () => {
      const res = await fetch("/api/roles", { credentials: "include" });
      if (!res.ok) throw new Error("تعذر جلب الأدوار");
      const body = await res.json();
      return (body.data?.roles || body.data || []) as Role[];
    },
    staleTime: 30_000,
  });

  const roles = data ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const permissions = permissionsCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(
        "/api/roles",
        withCsrf({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, nameAr, description, permissions }),
        })
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "فشل إنشاء الدور");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم إنشاء الدور", description: nameAr || name });
      setName("");
      setNameAr("");
      setPermissionsCsv("");
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.message || "حدث خطأ", variant: "destructive" });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Home className="h-4 w-4 ml-2" />
                الرئيسية
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5" /> إدارة الأدوار
              </h1>
            </div>
            <PermissionGuard anyOf={["roles.create"]} mode="hide">
              <Button onClick={() => setShowCreate((v) => !v)} className="flex items-center space-x-2 space-x-reverse">
                <Plus className="h-4 w-4" />
                <span>إنشاء دور</span>
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {showCreate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>إنشاء دور جديد</CardTitle>
              <CardDescription>أدخل بيانات الدور وحدد الصلاحيات (CSV)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم (En) *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="role-name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم (Ar) *</label>
                  <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="اسم الدور" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الصلاحيات (CSV)</label>
                <Input
                  value={permissionsCsv}
                  onChange={(e) => setPermissionsCsv(e.target.value)}
                  placeholder="users.read, users.create, posts.create, posts.update"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {permissionsCsv
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((p) => (
                      <Badge key={p} variant="secondary">{p}</Badge>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
                <PermissionGuard anyOf={["roles.create"]} mode="disable">
                  <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name || !nameAr}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Plus className="h-4 w-4 ml-2" />}
                    إنشاء
                  </Button>
                </PermissionGuard>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>قائمة الأدوار</CardTitle>
            <CardDescription>عرض جميع الأدوار مع عدد المستخدمين المرتبطين بكل دور</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : isError ? (
              <div className="py-8 flex items-center justify-center gap-3">
                <Button onClick={() => refetch()}>إعادة المحاولة</Button>
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center text-sm text-gray-500">لا توجد أدوار</div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الاسم (عربي)</TableHead>
                      <TableHead>عدد الصلاحيات</TableHead>
                      <TableHead>عدد المستخدمين</TableHead>
                      <TableHead className="text-left">الصلاحيات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.nameAr}</TableCell>
                        <TableCell>{r.permissions?.length || 0}</TableCell>
                        <TableCell>{r._count?.users ?? 0}</TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-wrap gap-2 max-w-xl">
                            {(r.permissions || []).slice(0, 12).map((p) => (
                              <Badge key={p} variant="outline">{p}</Badge>
                            ))}
                            {r.permissions && r.permissions.length > 12 ? (
                              <Badge variant="secondary">+{r.permissions.length - 12}</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

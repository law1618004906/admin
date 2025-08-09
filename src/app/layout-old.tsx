'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import TopBar from "@/components/custom/top-bar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import GlobalProgress from "@/components/custom/global-progress";
import Breadcrumbs from "@/components/custom/breadcrumbs";
import { toast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Home, FileText, MessagesSquare, Users, UserCircle, GitBranch, BarChart3, ShieldCheck, Settings, FileCode, Database } from "lucide-react";
import PermissionGuard from "@/components/custom/permission-guard";
import { AzureLoggerProvider } from "@/components/azure-logger-provider";
import ErrorBoundary from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// أضيف تهيئة خط Cairo كخط أساسي للنص العربي
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// تمت إزالة شارات الرسائل/المهام نهائيًا حسب الطلب

// أضف/عدّل الكلاس على العنصر الرئيسي لإضافة خلفية زجاجية عامة وخلفية متدرجة داكنة
// ابحث عن عنصر <body> داخل RootLayout وعدّل className ليشمل الخلفية والـ blur والدوائر الشفافة
// مثال سياق قريب:
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // إنشاء QueryClient مرة واحدة على العميل فقط
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000),
        staleTime: 15_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 800,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // لا تعرض رسائل للمفاتيح الحساسة أو أثناء الإلغاء
        if (query.state.status === 'error') {
          toast({
            title: 'حدث خطأ في جلب البيانات',
            description: (error as Error)?.message || 'تعذر تنفيذ العملية، حاول مرة أخرى.',
            variant: 'destructive',
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        toast({
          title: 'فشل تنفيذ العملية',
          description: (error as Error)?.message || 'تعذر إكمال الطلب.',
          variant: 'destructive',
        });
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        // يمكن لاحقًا تخصيص بحسب نوع العملية
        toast({ title: 'تم الحفظ بنجاح', description: 'تم تنفيذ العملية بنجاح.' });
      },
    }),
  }));
  const pathname = usePathname();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`min-h-screen antialiased ${cairo.variable} ${geistSans.variable} ${geistMono.variable} font-[var(--font-cairo)] bg-background text-foreground`}
      >
        <QueryClientProvider client={queryClient}>
          <AzureLoggerProvider>
            <ErrorBoundary>
              <AuthProvider>
              <SidebarProvider>
                {/* الشريط الجانبي مخفي في صفحة تسجيل الدخول */}
                {!(pathname?.startsWith('/login')) && (
                  <Sidebar variant="inset" collapsible="icon" side="right">
                    <SidebarHeader className="border-b">
                      <div className="flex h-[52px] items-center px-3">
                        <div className="text-sm font-medium text-sidebar-foreground">لوحة التحكم</div>
                      </div>
                    </SidebarHeader>
                    <SidebarContent className="px-2 py-2">
                      <SidebarGroup>
                        <SidebarGroupLabel className="text-xs text-sidebar-foreground/70 px-3 py-2">
                          التنقل الرئيسي
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu className="space-y-1">
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild isActive={pathname === '/'} className="h-9">
                                <Link href="/" className="flex items-center gap-3">
                                  <Home className="h-4 w-4 shrink-0" />
                                  <span>الرئيسية</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <PermissionGuard anyOf={["posts.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/posts')} className="h-9">
                                  <Link href="/posts" className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 shrink-0" />
                                    <span>المنشورات</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["messages.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/messages')} className="h-9">
                                  <Link href="/messages" className="flex items-center gap-3">
                                    <MessagesSquare className="h-4 w-4 shrink-0" />
                                    <span>الرسائل</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["individuals.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/individuals')} className="h-9">
                                  <Link href="/individuals" className="flex items-center gap-3">
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>الأفراد</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["leaders.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/leaders')} className="h-9">
                                  <Link href="/leaders" className="flex items-center gap-3">
                                    <GitBranch className="h-4 w-4 shrink-0" />
                                    <span>القيادات</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["reports.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/reports')} className="h-9">
                                  <Link href="/reports" className="flex items-center gap-3">
                                    <BarChart3 className="h-4 w-4 shrink-0" />
                                    <span>التقارير</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["roles.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/roles')} className="h-9">
                                  <Link href="/roles" className="flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    <span>الأدوار</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["settings.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/setup')} className="h-9">
                                  <Link href="/setup" className="flex items-center gap-3">
                                    <Settings className="h-4 w-4 shrink-0" />
                                    <span>الإعدادات</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["logs.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/logs')} className="h-9">
                                  <Link href="/logs" className="flex items-center gap-3">
                                    <FileCode className="h-4 w-4 shrink-0" />
                                    <span>السجلات</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                            <PermissionGuard anyOf={["backup.read"]} mode="hide">
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname?.startsWith('/backup')} className="h-9">
                                  <Link href="/backup" className="flex items-center gap-3">
                                    <Database className="h-4 w-4 shrink-0" />
                                    <span>النسخ الاحتياطي</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </PermissionGuard>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="border-t p-3">
                      <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
                        <UserCircle className="h-4 w-4" />
                        <span>نظام الإدارة</span>
                      </div>
                    </SidebarFooter>
                  </Sidebar>
                )}

                <SidebarInset className="min-h-screen">
                  {/* إخفاء TopBar & breadcrumbs في صفحة تسجيل الدخول */}
                  {!(pathname?.startsWith('/login')) && <TopBar />}
                  {!(pathname?.startsWith('/login')) && <Breadcrumbs />}
                  <GlobalProgress />
                  <main className="flex-1 p-6">
                    {children}
                  </main>
                  <Toaster />
                </SidebarInset>
              </SidebarProvider>
            </AuthProvider>
            </ErrorBoundary>
          </AzureLoggerProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}

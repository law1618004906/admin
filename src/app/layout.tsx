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
        className={`min-h-screen antialiased relative overflow-x-hidden ${cairo.variable} ${geistSans.variable} ${geistMono.variable} font-[var(--font-cairo)]`}
      >
        {/* طبقة زجاجية عامة خفيفة أعلى الخلفية */}
        <div className="pointer-events-none fixed inset-0 backdrop-blur-xl bg-white/5 dark:bg-black/10" />
        {/* زينة دوائر نصف شفافة لمسة حديثة */}
        <div className="pointer-events-none fixed -top-24 -left-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />

        {/* غلاف عام يفرض زوايا ناعمة وشفافية على الحاويات الشائعة */}
        <div className="relative">
          {/* تأطير تلقائي للعناصر الشائعة عبر صنف container الافتراضي */}
          <div className="container mx-auto px-4">
            <QueryClientProvider client={queryClient}>
              <AzureLoggerProvider>
                <AuthProvider>
                  <SidebarProvider>
                  {/* الشريط الجانبي مخفي في صفحة تسجيل الدخول */}
                  {!(pathname?.startsWith('/login')) && (
                    <Sidebar variant="inset" collapsible="icon">
                      <SidebarHeader>
                        <div className="text-sm text-white/70">لوحة التحكم</div>
                      </SidebarHeader>
                      <SidebarContent>
                        <SidebarGroup>
                          <SidebarGroupLabel>التنقل</SidebarGroupLabel>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/'} className="gap-2">
                                  <Link href="/">
                                    <span>الرئيسية</span>
                                    <Home className="h-4 w-4 shrink-0" />
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                              <PermissionGuard anyOf={["posts.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/posts')} className="gap-2">
                                    <Link href="/posts">
                                      <span>المنشورات</span>
                                      <FileText className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["messages.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/messages')} className="gap-2">
                                    <Link href="/messages">
                                      <span>الرسائل</span>
                                      <MessagesSquare className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["individuals.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/individuals')} className="gap-2">
                                    <Link href="/individuals">
                                      <span>الأفراد</span>
                                      <Users className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["leaders.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/leaders')} className="gap-2">
                                    <Link href="/leaders">
                                      <span>القيادات</span>
                                      <GitBranch className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["reports.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/reports')} className="gap-2">
                                    <Link href="/reports">
                                      <span>التقارير</span>
                                      <BarChart3 className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["roles.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/roles')} className="gap-2">
                                    <Link href="/roles">
                                      <span>الأدوار</span>
                                      <ShieldCheck className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["settings.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/setup')} className="gap-2">
                                    <Link href="/setup">
                                      <span>الإعدادات</span>
                                      <Settings className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["logs.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/logs')} className="gap-2">
                                    <Link href="/logs">
                                      <span>السجلات</span>
                                      <FileCode className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                              <PermissionGuard anyOf={["backup.read"]} mode="hide">
                                <SidebarMenuItem>
                                  <SidebarMenuButton asChild isActive={pathname?.startsWith('/backup')} className="gap-2">
                                    <Link href="/backup">
                                      <span>النسخ الاحتياطي</span>
                                      <Database className="h-4 w-4 shrink-0" />
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </PermissionGuard>
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </SidebarGroup>
                      </SidebarContent>
                      <SidebarFooter>
                        <div className="text-xs text-white/50 flex items-center gap-2">
                          <UserCircle className="h-4 w-4" />
                          <span>مرحبًا بك</span>
                        </div>
                      </SidebarFooter>
                    </Sidebar>
                  )}

                  <SidebarInset>
                    {/* إخفاء TopBar & breadcrumbs في صفحة تسجيل الدخول */}
                    {!(pathname?.startsWith('/login')) && <TopBar />}
                    {!(pathname?.startsWith('/login')) && <Breadcrumbs />}
                    <GlobalProgress />
                    {children}
                    <Toaster />
                  </SidebarInset>
                </SidebarProvider>
              </AuthProvider>
              </AzureLoggerProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </div>
        </div>
      </body>
    </html>
  );
}

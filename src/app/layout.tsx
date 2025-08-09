'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthCheck from "@/components/AuthCheck";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
import { Home, FileText, Users, UserCircle, GitBranch, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        toast({ title: 'تم الحفظ بنجاح', description: 'تم تنفيذ العملية بنجاح.' });
      },
    }),
  }));
  
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = '/login';
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`min-h-screen antialiased ${cairo.variable} ${geistSans.variable} ${geistMono.variable} font-[var(--font-cairo)] bg-background text-foreground`}
      >
        <QueryClientProvider client={queryClient}>
          <AuthCheck>
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
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.startsWith('/leaders')} className="h-9">
                              <Link href="/leaders" className="flex items-center gap-3">
                                <UserCircle className="h-4 w-4 shrink-0" />
                                <span>القادة</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.startsWith('/individuals')} className="h-9">
                              <Link href="/individuals" className="flex items-center gap-3">
                                <Users className="h-4 w-4 shrink-0" />
                                <span>الأفراد</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.startsWith('/leaders-tree')} className="h-9">
                              <Link href="/leaders-tree" className="flex items-center gap-3">
                                <GitBranch className="h-4 w-4 shrink-0" />
                                <span>شجرة القادة</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </SidebarContent>
                  <SidebarFooter className="border-t p-2">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </SidebarFooter>
                </Sidebar>
              )}
              
              <SidebarInset className="flex-1">
                {!(pathname?.startsWith('/login')) && (
                  <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2 px-4">
                      <div className="flex flex-col">
                        <h1 className="text-lg font-semibold">نظام إدارة القادة والأفراد</h1>
                        <p className="text-sm text-muted-foreground">مكتب النائب علي الحميداوي</p>
                      </div>
                    </div>
                  </header>
                )}
                
                <main className={pathname?.startsWith('/login') ? '' : 'flex-1 p-4'}>
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </AuthCheck>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}

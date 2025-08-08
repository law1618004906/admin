"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function toTitle(arSegment: string) {
  const map: Record<string, string> = {
    "": "الرئيسية",
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    posts: "المنشورات",
    create: "إنشاء",
    users: "المستخدمون",
    "my-activities": "أنشطتي",
    "my-activity": "نشاطي",
    "my-individuals": "أفرادي",
    individuals: "الأفراد",
    leaders: "القيادات",
    "leaders-tree": "شجرة القيادات",
    messages: "الرسائل",
    reports: "التقارير",
    roles: "الأدوار",
    setup: "الإعداد",
    login: "تسجيل الدخول",
    telegram: "تيليغرام",
  };
  return (
    map[arSegment] ||
    arSegment
      .replaceAll("-", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase())
  );
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const items = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const acc: { label: string; href: string; isLast: boolean }[] = [];
    let href = "";
    segments.forEach((seg, idx) => {
      href += `/${seg}`;
      acc.push({
        label: toTitle(decodeURIComponent(seg)),
        href,
        isLast: idx === segments.length - 1,
      });
    });
    // الصفحة الرئيسية فقط
    if (acc.length === 0) {
      return [{ label: toTitle(""), href: "/", isLast: true }];
    }
    return [{ label: toTitle(""), href: "/", isLast: false }, ...acc];
  }, [pathname]);

  // إخفاء في صفحة تسجيل الدخول
  if (pathname.startsWith("/login")) return null;

  return (
    <div className="py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((it, i) => (
            <BreadcrumbItem key={i}>
              {it.isLast ? (
                <BreadcrumbPage>{it.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={it.href}>{it.label}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

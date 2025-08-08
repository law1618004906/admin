"use client";

import { useEffect, useRef } from "react";
import NProgress from "nprogress";
import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

// Lightweight global progress controller
export default function GlobalProgress() {
  const pathname = usePathname();
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const startedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.08 });
  }, []);

  // Start/stop on React Query network activity
  useEffect(() => {
    const active = fetching + mutating > 0;
    if (active && !startedRef.current) {
      startedRef.current = true;
      NProgress.start();
    }
    if (!active && startedRef.current) {
      // Small delay to avoid flicker
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        NProgress.done();
        startedRef.current = false;
      }, 180);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetching, mutating]);

  // Brief progress on route change
  useEffect(() => {
    if (!pathname) return;
    NProgress.start();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      NProgress.done();
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

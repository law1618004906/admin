'use client';

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
  allOf?: string[];
  anyOf?: string[];
  mode?: 'hide' | 'disable';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ allOf, anyOf, mode = 'hide', children, fallback }: PermissionGuardProps) {
  const { has } = usePermissions();

  const passAll = allOf ? allOf.every((p) => has(p)) : true;
  const passAny = anyOf ? anyOf.some((p) => has(p)) : true;
  const allowed = passAll && passAny;

  if (allowed) return <>{children}</>;

  if (mode === 'hide') {
    return fallback ? <>{fallback}</> : null;
  }

  // disable mode: attempt to clone and set disabled
  if (React.isValidElement(children)) {
    const childProps: any = { disabled: true, 'aria-disabled': true, tabIndex: -1 };
    return React.cloneElement(children as any, childProps);
  }

  return fallback ? <>{fallback}</> : null;
}

export default PermissionGuard;

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface MeResponse {
  user?: {
    id: string;
    email: string;
    role?: string;
    roleId?: string | null;
  } | null;
  error?: string;
}

export function usePermissions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<string>('USER');
  const [roleId, setRoleId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data: MeResponse = await res.json();
      if (!res.ok || !data?.user) {
        throw new Error(data?.error || 'Unauthorized');
      }
      const rName = (data.user.role || 'USER').toUpperCase();
      setRoleName(rName);
      setRoleId(data.user.roleId ?? null);

      // ADMIN shortcut
      if (rName === 'ADMIN') {
        setPermissions(['all']);
        return;
      }

      // If we have roleId, fetch role details to get permissions
      if (data.user.roleId) {
        const r = await fetch(`/api/roles/${data.user.roleId}`, { credentials: 'include' });
        const rJson = await r.json();
        if (r.ok && rJson?.data?.permissions) {
          const perms = Array.isArray(rJson.data.permissions) ? rJson.data.permissions : [];
          setPermissions(perms);
        } else {
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const has = useCallback(
    (perm: string) => {
      if (roleName === 'ADMIN') return true;
      if (!perm) return false;
      return permissions.includes('all') || permissions.includes(perm);
    },
    [permissions, roleName]
  );

  const value = useMemo(
    () => ({ loading, error, roleName, roleId, permissions, has, refresh: fetchMe }),
    [loading, error, roleName, roleId, permissions, has, fetchMe]
  );

  return value;
}

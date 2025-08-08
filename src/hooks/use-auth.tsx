'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { withCsrf } from '@/lib/csrf-client';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phone?: string;
  avatar?: string;
  role: {
    id: string;
    name: string;
    nameAr: string;
    permissions: string[] | string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استعادة الجلسة من الكوكي عبر API
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data.data || null);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(
        '/api/auth/login',
        withCsrf({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        })
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user || data.data || null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // استدعاء API الخروج لمسح الكوكي
    fetch(
      '/api/auth/logout',
      withCsrf({
        method: 'POST',
        credentials: 'include',
      })
    ).finally(() => {
      setUser(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role.permissions) return false;
    
    try {
      const permissions = Array.isArray(user.role.permissions) ? user.role.permissions : JSON.parse(user.role.permissions);
      return Array.isArray(permissions) && permissions.includes(permission);
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

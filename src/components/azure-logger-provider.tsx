'use client';

import React, { createContext, useContext, useEffect } from 'react';
import azureLogger from '@/lib/azure-logger';

interface AzureLoggerContextType {
  trackEvent: (name: string, properties?: any, measurements?: any) => void;
  trackException: (error: Error, properties?: any) => void;
  trackUserActivity: (action: string, userId?: string, properties?: any) => void;
  trackPagePerformance: (pageName: string, loadTime: number) => void;
  setUserId: (userId: string) => void;
  clearUserId: () => void;
}

const AzureLoggerContext = createContext<AzureLoggerContextType | null>(null);

interface AzureLoggerProviderProps {
  children: React.ReactNode;
}

export function AzureLoggerProvider({ children }: AzureLoggerProviderProps) {
  useEffect(() => {
    // تسجيل زمن تحميل الصفحة
    const handleLoad = () => {
      const loadTime = performance.now();
      azureLogger.trackPagePerformance(window.location.pathname, loadTime);
    };

    // تسجيل الأخطاء غير المعالجة
    const handleError = (event: ErrorEvent) => {
      azureLogger.trackException(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href
      });
    };

    // تسجيل الوعود المرفوضة غير المعالجة
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      azureLogger.trackException(new Error(String(event.reason)), {
        type: 'UnhandledPromiseRejection',
        url: window.location.href
      });
    };

    window.addEventListener('load', handleLoad);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const contextValue: AzureLoggerContextType = {
    trackEvent: azureLogger.trackEvent.bind(azureLogger),
    trackException: azureLogger.trackException.bind(azureLogger),
    trackUserActivity: azureLogger.trackUserActivity.bind(azureLogger),
    trackPagePerformance: azureLogger.trackPagePerformance.bind(azureLogger),
    setUserId: azureLogger.setUserId.bind(azureLogger),
    clearUserId: azureLogger.clearUserId.bind(azureLogger),
  };

  return (
    <AzureLoggerContext.Provider value={contextValue}>
      {children}
    </AzureLoggerContext.Provider>
  );
}

export function useAzureLogger() {
  const context = useContext(AzureLoggerContext);
  if (!context) {
    throw new Error('useAzureLogger must be used within an AzureLoggerProvider');
  }
  return context;
}

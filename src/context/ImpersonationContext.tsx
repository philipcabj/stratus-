'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface ImpersonationState {
  impersonatedTenantId: string | null;
  impersonatedName: string | null;
  impersonate: (tenantId: string, tenantName: string) => void;
  clearImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationState | null>(null);

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [impersonatedTenantId, setTenantId] = useState<string | null>(null);
  const [impersonatedName, setName] = useState<string | null>(null);

  const impersonate = useCallback((tenantId: string, tenantName: string) => {
    setTenantId(tenantId);
    setName(tenantName);
  }, []);

  const clearImpersonation = useCallback(() => {
    setTenantId(null);
    setName(null);
  }, []);

  return (
    <ImpersonationContext.Provider
      value={{ impersonatedTenantId, impersonatedName, impersonate, clearImpersonation }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation(): ImpersonationState {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) throw new Error('useImpersonation must be used within ImpersonationProvider');
  return ctx;
}

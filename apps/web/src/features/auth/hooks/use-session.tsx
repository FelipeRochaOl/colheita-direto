import type { AuthSession, UserRole } from '@colheita/contracts';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient, browserSessionStorage } from '../../../app/api-client';

interface SessionContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Sessão do usuário logado, sincronizada com o armazenamento do navegador. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const reloadSession = () => browserSessionStorage.load().then((stored) => {
      setSession(stored);
      setIsLoading(false);
    });
    void reloadSession();
    window.addEventListener('colheita-session-changed', reloadSession);
    return () => window.removeEventListener('colheita-session-changed', reloadSession);
  }, []);

  const hasRole = useCallback((role: UserRole) => Boolean(session?.user.roles.includes(role)), [session]);
  const logout = useCallback(() => apiClient.logout(), []);

  return <SessionContext.Provider value={{ session, isLoading, hasRole, logout }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession precisa estar dentro de <SessionProvider>');
  return context;
}

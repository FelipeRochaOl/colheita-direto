import type { AuthSession, UserRole } from '@colheita/contracts';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { secureSessionStorage } from '../../app/secure-session-storage';

interface SessionContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void secureSessionStorage.load().then((stored) => {
      setSession(stored);
      setIsLoading(false);
    });
    return secureSessionStorage.subscribe(setSession);
  }, []);

  const hasRole = (role: UserRole) => Boolean(session?.user.roles.includes(role));
  return <SessionContext.Provider value={{ session, isLoading, hasRole }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession precisa estar dentro de <SessionProvider>');
  return context;
}

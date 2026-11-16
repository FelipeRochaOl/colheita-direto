import type { UserRole } from '@colheita/contracts';
import { Spin } from 'antd';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../hooks/use-session';

/** Protege uma página: sem login vai para /entrar; sem o perfil vai para /cadastro. */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { session, isLoading, hasRole } = useSession();
  const location = useLocation();

  if (isLoading) return <Spin className="block! mx-auto! mt-16!" />;
  if (!session)
    return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname)}`} replace />;
  if (!hasRole(role)) return <Navigate to={`/cadastro?perfil=${role}`} replace />;
  return <>{children}</>;
}

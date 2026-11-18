import type { UserRole } from '@colheita/contracts';

/** Área principal de cada perfil (para onde o usuário vai depois de entrar ou se cadastrar). */
export const HOME_BY_ROLE: Partial<Record<UserRole, string>> = {
  producer: '/produtor',
  buyer: '/mercado',
  ngo: '/doacoes',
  service_provider: '/',
};

/** Links de área por perfil, mostrados no topo para quem está logado. */
export const ROLE_AREA_LINKS: Array<{ role: UserRole; to: string; label: string }> = [
  { role: 'producer', to: '/produtor', label: 'Minha produção' },
  { role: 'buyer', to: '/pedidos', label: 'Meus pedidos' },
  { role: 'ngo', to: '/doacoes', label: 'Doações' },
];

/** Destino depois do login: o pedido explícito (voltar), a área do primeiro perfil ou o cadastro. */
export function landingPathFor(roles: UserRole[], requestedPath: string | null): string {
  if (requestedPath) return requestedPath;
  const firstRoleWithHome = roles.find((role) => HOME_BY_ROLE[role]);
  return firstRoleWithHome ? HOME_BY_ROLE[firstRoleWithHome]! : '/cadastro';
}

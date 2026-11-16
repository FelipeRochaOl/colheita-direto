import type { UserRole } from '@colheita/contracts';

/** Dados do usuário autenticado extraídos do JWT. */
export interface AuthenticatedUser {
  userId: string;
  phoneNumber: string;
  roles: UserRole[];
}

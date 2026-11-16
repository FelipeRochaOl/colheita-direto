import type { AuthSession } from '@colheita/contracts';

/** Onde a sessão fica guardada: localStorage no web, SecureStore no mobile. */
export interface SessionStorage {
  load(): Promise<AuthSession | null>;
  save(session: AuthSession): Promise<void>;
  clear(): Promise<void>;
}

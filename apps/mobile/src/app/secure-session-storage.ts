import { SessionStorage } from '@colheita/api-client';
import type { AuthSession } from '@colheita/contracts';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'colheita-direta-session';
type SessionListener = (session: AuthSession | null) => void;

/** Sessão guardada no armazenamento seguro do aparelho (Keychain / Keystore). */
class SecureSessionStorage implements SessionStorage {
  private readonly listeners = new Set<SessionListener>();

  async load(): Promise<AuthSession | null> {
    const stored = await SecureStore.getItemAsync(SESSION_KEY);
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  }

  async save(session: AuthSession): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    this.listeners.forEach((listener) => listener(session));
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    this.listeners.forEach((listener) => listener(null));
  }

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const secureSessionStorage = new SecureSessionStorage();

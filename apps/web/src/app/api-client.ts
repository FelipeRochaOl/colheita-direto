import { ColheitaApiClient, SessionStorage } from '@colheita/api-client';
import type { AuthSession } from '@colheita/contracts';

const SESSION_STORAGE_KEY = 'colheita-direta:session';

class BrowserSessionStorage implements SessionStorage {
  async load(): Promise<AuthSession | null> {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  async save(session: AuthSession): Promise<void> {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('colheita-session-changed'));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event('colheita-session-changed'));
  }
}

export const browserSessionStorage = new BrowserSessionStorage();

export const apiClient = new ColheitaApiClient(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', browserSessionStorage, () =>
  window.location.assign('/entrar'),
);

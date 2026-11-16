import { ColheitaApiClient } from '@colheita/api-client';
import { secureSessionStorage } from './secure-session-storage';

export const apiClient = new ColheitaApiClient(
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  secureSessionStorage,
);

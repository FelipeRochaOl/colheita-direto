import { createContext, ReactNode, useContext } from 'react';
import { ColheitaApiClient } from './api-client';

const ApiClientContext = createContext<ColheitaApiClient | null>(null);

export function ApiClientProvider({ client, children }: { client: ColheitaApiClient; children: ReactNode }) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export function useApiClient(): ColheitaApiClient {
  const client = useContext(ApiClientContext);
  if (!client) throw new Error('useApiClient precisa estar dentro de <ApiClientProvider>');
  return client;
}

import AntDesignProvider from '@ant-design/react-native/lib/provider';
import { ApiClientProvider } from '@colheita/api-client';
import { antDesignMobileTheme } from '@colheita/design-tokens';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../features/auth/session-context';
import { apiClient } from './api-client';
import { AppNavigation } from './navigation';
import { QUERY_CACHE_MAX_AGE_MS, queryClient, queryPersister } from './query-client';

export function App() {
  return (
    <SafeAreaProvider>
      <AntDesignProvider theme={antDesignMobileTheme}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, maxAge: QUERY_CACHE_MAX_AGE_MS }}
          // Ao reabrir o app, reenvia lotes criados sem internet.
          onSuccess={() => void queryClient.resumePausedMutations()}
        >
          <ApiClientProvider client={apiClient}>
            <SessionProvider>
              <StatusBar style="dark" />
              <AppNavigation />
            </SessionProvider>
          </ApiClientProvider>
        </PersistQueryClientProvider>
      </AntDesignProvider>
    </SafeAreaProvider>
  );
}

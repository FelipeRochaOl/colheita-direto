import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@colheita/api-client';
import {
  CREATE_HARVEST_LOT_MUTATION_KEY,
  createHarvestLotFromDevice,
  OfflineHarvestLotInput,
} from '../features/harvest-lots/offline-harvest-lot-mutation';
import { apiClient } from './api-client';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// O React Query passa a saber quando o celular está sem internet: pausa requisições e mutações.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: ONE_DAY_MS, staleTime: 30_000, retry: 1 },
    mutations: { networkMode: 'offlineFirst' },
  },
});

// Definida aqui (e não no componente) para poder ser retomada depois que o app reabrir.
queryClient.setMutationDefaults(CREATE_HARVEST_LOT_MUTATION_KEY, {
  mutationFn: (input: OfflineHarvestLotInput) => createHarvestLotFromDevice(apiClient, input),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.harvestLots }),
  retry: 3,
});

/** Cache e fila de mutações salvos no aparelho (sem SQLite). */
export const queryPersister = createAsyncStoragePersister({ storage: AsyncStorage });
export const QUERY_CACHE_MAX_AGE_MS = ONE_DAY_MS;

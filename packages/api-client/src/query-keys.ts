import type { SearchOffersInput, SearchServiceProvidersInput } from '@colheita/contracts';

/** Chaves do React Query num só lugar, para invalidar o cache sem erro de digitação. */
export const queryKeys = {
  offers: (filters: SearchOffersInput) => ['offers', filters] as const,
  offer: (offerId: string) => ['offers', 'detail', offerId] as const,
  harvestLots: ['harvest-lots'] as const,
  harvestLot: (harvestLotId: string) => ['harvest-lots', harvestLotId] as const,
  orders: ['orders'] as const,
  farmSummary: ['farm-summary'] as const,
  donations: ['donations'] as const,
  impactIndicators: ['impact-indicators'] as const,
  myProfile: (role: 'producer' | 'buyer' | 'ngo' | 'service_provider') => ['my-profile', role] as const,
  availableServiceProviders: (input: SearchServiceProvidersInput) => ['available-service-providers', input] as const,
  serviceRequests: ['service-requests'] as const,
};

import type { SearchOffersInput } from '@colheita/contracts';

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
};

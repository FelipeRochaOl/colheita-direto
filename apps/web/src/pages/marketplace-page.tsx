import { useOffers } from '@colheita/api-client';
import type { SearchOffersInput } from '@colheita/contracts';
import { PageSection } from '@colheita/ui-web';
import { Alert, Empty, Skeleton } from 'antd';
import { useState } from 'react';
import { OfferCard } from '../features/catalog/components/offer-card';
import { OfferFilters } from '../features/catalog/components/offer-filters';

export function MarketplacePage() {
  const [filters, setFilters] = useState<SearchOffersInput>({});
  const { data: offers, isLoading, error } = useOffers(filters);

  return (
    <PageSection title="Comprar direto do produtor">
      <OfferFilters filters={filters} onChange={setFilters} />
      {error && <Alert type="error" message={error.message} />}
      {isLoading && <Skeleton active />}
      {offers && !offers.length && <Empty description="Nenhuma oferta com esses filtros" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {offers?.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
      </div>
    </PageSection>
  );
}

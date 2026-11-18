import type {
  DonationStatus,
  HarvestLotStatus,
  LotDestination,
  OrderStatus,
  ServicePriceUnit,
  ServiceRequestStatus,
  ServiceType,
} from '@colheita/contracts';

export const harvestLotStatusLabels: Record<HarvestLotStatus, string> = {
  PENDING_CLASSIFICATION: 'Classificando…',
  NEEDS_REVIEW: 'Confira a classificação',
  CLASSIFIED: 'Escolha o destino',
  LISTED: 'À venda',
  SOLD: 'Vendido',
  DONATION_OFFERED: 'Oferecido para doação',
  DONATED: 'Doado',
  DISCARDED: 'Reaproveitado',
};

export const lotDestinationLabels: Record<LotDestination, string> = {
  MARKETPLACE: 'Vender (preço cheio)',
  DISCOUNT_MARKETPLACE: 'Vender com desconto',
  AUCTION: 'Leilão',
  INDUSTRY: 'Vender para indústria',
  DONATION: 'Doar para banco de alimentos',
  ANIMAL_FEED: 'Ração animal (vegetal)',
  COMPOST: 'Compostagem',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  CREATED: 'Aguardando Pix',
  PAID: 'Pago',
  ACCEPTED: 'Aceito pelo produtor',
  IN_TRANSIT: 'A caminho',
  DELIVERED: 'Entregue',
  SETTLED: 'Finalizado',
  CANCELLED: 'Cancelado',
  DISPUTED: 'Em análise',
};

export const donationStatusLabels: Record<DonationStatus, string> = {
  OFFERED: 'Disponível',
  ACCEPTED: 'Aceita',
  PICKED_UP: 'Retirada',
  RECEIVED: 'Recebida',
  EXPIRED: 'Expirada',
};

export const serviceTypeLabels: Record<ServiceType, string> = {
  TRANSPORT: 'Transporte / frete',
  COLD_STORAGE: 'Câmara fria',
  PACKING: 'Embalagem / beneficiamento',
  GRADING: 'Classificação presencial',
  TECHNICAL_ASSISTANCE: 'Assistência técnica',
};

/** Como o preço é lido ("R$ 2,50 por km") e o que o produtor informa como quantidade. */
export const servicePriceUnitLabels: Record<ServicePriceUnit, { per: string; quantity: string }> = {
  KM: { per: 'por km', quantity: 'Distância da viagem (km)' },
  BOX_DAY: { per: 'por caixa/dia', quantity: 'Caixas × dias' },
  BOX: { per: 'por caixa', quantity: 'Caixas' },
  VISIT: { per: 'por visita', quantity: 'Visitas' },
};

export const serviceRequestStatusLabels: Record<ServiceRequestStatus, string> = {
  REQUESTED: 'Aguardando resposta',
  ACCEPTED: 'Aceita',
  DECLINED: 'Recusada',
};

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

import { Inject, Injectable } from '@nestjs/common';
import type { ImpactIndicators } from '@colheita/contracts';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../../harvest-lots/repositories/harvest-lot.repository';
import { ORDER_REPOSITORY, OrderRepository } from '../../orders/repositories/order.repository';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { DONATION_REPOSITORY, DonationRepository } from '../../surplus/repositories/donation.repository';

/** KPIs do piloto (concepcao.md §5.1): kg vendidos, kg doados, aproveitamento, tempo até a venda, renda. */
@Injectable()
export class GetImpactIndicatorsUseCase {
  constructor(
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(DONATION_REPOSITORY) private readonly donationRepository: DonationRepository,
  ) {}

  async execute(): Promise<ImpactIndicators> {
    const [activeProducers, lotTotals, salesTotals, kilogramsDonated] = await Promise.all([
      this.producerRepository.countAll(),
      this.harvestLotRepository.calculateTotals(),
      this.orderRepository.calculateSalesTotals(),
      this.donationRepository.sumReceivedWeightKg(),
    ]);
    const kilogramsWithDestination = salesTotals.kilogramsSold + kilogramsDonated;
    const utilizationRate =
      lotTotals.kilogramsClassified > 0 ? Math.min(1, kilogramsWithDestination / lotTotals.kilogramsClassified) : 0;

    return {
      activeProducers,
      lotsClassified: lotTotals.lotsClassified,
      kilogramsSold: Math.round(salesTotals.kilogramsSold),
      kilogramsDonated: Math.round(kilogramsDonated),
      utilizationRate: Math.round(utilizationRate * 1000) / 1000,
      averageHoursToSale:
        salesTotals.averageHoursToSale === null ? null : Math.round(salesTotals.averageHoursToSale * 10) / 10,
      revenueToProducers: Math.round(salesTotals.revenueToProducers * 100) / 100,
    };
  }
}

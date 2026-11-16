import { Inject, Injectable } from '@nestjs/common';
import { HarvestLot } from '../../harvest-lots/entities/harvest-lot.entity';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../../harvest-lots/repositories/harvest-lot.repository';
import { Offer } from '../../marketplace/entities/offer.entity';
import { OFFER_REPOSITORY, OfferRepository } from '../../marketplace/repositories/offer.repository';
import { ORDER_REPOSITORY, OrderRepository } from '../../orders/repositories/order.repository';
import { ExpenseProps } from '../entities/expense.entity';
import { EXPENSE_REPOSITORY, ExpenseRepository } from '../repositories/expense.repository';

export interface StockByCrop {
  crop: string;
  boxesAvailable: number;
  boxesAwaitingClassification: number;
}

export interface FarmSummary {
  periodDays: number;
  revenue: number;
  expenses: number;
  profit: number;
  stock: StockByCrop[];
  recentExpenses: ExpenseProps[];
}

/** Resumo de bolso: receitas (vendas pagas), despesas, lucro e estoque por cultura. */
@Injectable()
export class GetFarmSummaryUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    @Inject(OFFER_REPOSITORY) private readonly offerRepository: OfferRepository,
  ) {}

  async execute(producerId: string, periodDays = 30): Promise<FarmSummary> {
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const [expenses, orders, unroutedLots, activeOffers] = await Promise.all([
      this.expenseRepository.findByProducerSince(producerId, since),
      this.orderRepository.findByParticipant(producerId),
      this.harvestLotRepository.findByProducer(producerId, ['PENDING_CLASSIFICATION', 'NEEDS_REVIEW', 'CLASSIFIED']),
      this.offerRepository.findActiveByProducer(producerId),
    ]);

    const revenue = orders
      .filter((order) => order.producerId === producerId && order.isPaid() && order.status !== 'CANCELLED')
      .filter((order) => order.toSnapshot().paidAt! >= since)
      .reduce((sum, order) => sum + order.producerPayout, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      periodDays,
      revenue: this.roundToCents(revenue),
      expenses: this.roundToCents(totalExpenses),
      profit: this.roundToCents(revenue - totalExpenses),
      stock: this.groupStockByCrop(unroutedLots, activeOffers),
      recentExpenses: expenses.slice(0, 10).map((expense) => expense.toSnapshot()),
    };
  }

  /** Estoque = lotes ainda sem destino + caixas que restam nas ofertas publicadas. */
  private groupStockByCrop(unroutedLots: HarvestLot[], activeOffers: Offer[]): StockByCrop[] {
    const stockByCrop = new Map<string, StockByCrop>();
    const stockFor = (crop: string) => {
      const stock = stockByCrop.get(crop) ?? { crop, boxesAvailable: 0, boxesAwaitingClassification: 0 };
      stockByCrop.set(crop, stock);
      return stock;
    };
    for (const lot of unroutedLots) {
      if (lot.status === 'CLASSIFIED') stockFor(lot.crop).boxesAvailable += lot.quantityBoxes;
      else stockFor(lot.crop).boxesAwaitingClassification += lot.quantityBoxes;
    }
    for (const offer of activeOffers) {
      stockFor(offer.crop).boxesAvailable += offer.availableBoxes;
    }
    return [...stockByCrop.values()];
  }

  private roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

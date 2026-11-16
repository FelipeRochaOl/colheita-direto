import { Injectable } from '@nestjs/common';
import type { LotDestination, QualityGrade } from '@colheita/contracts';

/**
 * Regra central do produto: a classe de qualidade define o destino recomendado.
 * A/B → venda; C → indústria (polpa, molho); D → doação (se próprio para consumo).
 */
@Injectable()
export class LotDestinationPolicy {
  private static readonly DESTINATION_BY_GRADE: Record<QualityGrade, LotDestination> = {
    A: 'MARKETPLACE',
    B: 'DISCOUNT_MARKETPLACE',
    C: 'INDUSTRY',
    D: 'DONATION',
  };

  recommendDestination(grade: QualityGrade): LotDestination {
    return LotDestinationPolicy.DESTINATION_BY_GRADE[grade];
  }

  /** Destinos que o produtor pode escolher para cada classe (não se vende lote D no marketplace). */
  allowedDestinations(grade: QualityGrade): LotDestination[] {
    const destinationsByGrade: Record<QualityGrade, LotDestination[]> = {
      A: ['MARKETPLACE', 'DISCOUNT_MARKETPLACE', 'INDUSTRY', 'DONATION'],
      B: ['DISCOUNT_MARKETPLACE', 'MARKETPLACE', 'INDUSTRY', 'DONATION'],
      C: ['INDUSTRY', 'DONATION', 'ANIMAL_FEED', 'COMPOST'],
      D: ['DONATION', 'ANIMAL_FEED', 'COMPOST'],
    };
    return destinationsByGrade[grade];
  }
}

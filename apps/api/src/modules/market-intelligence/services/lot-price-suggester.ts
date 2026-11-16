import { Inject, Injectable } from '@nestjs/common';
import type { QualityGrade } from '@colheita/contracts';
import { PriceReference } from '../entities/price-reference.entity';
import { PRICE_REFERENCE_REPOSITORY, PriceReferenceRepository } from '../repositories/price-reference.repository';

/** Fator sobre o preço de referência por classe de qualidade (validar no piloto). */
const GRADE_PRICE_FACTORS: Record<QualityGrade, number> = { A: 1, B: 0.75, C: 0.4, D: 0 };

export interface PriceSuggestionInput {
  crop: string;
  grade: QualityGrade;
  boxWeightKg: number;
}

@Injectable()
export class LotPriceSuggester {
  constructor(
    @Inject(PRICE_REFERENCE_REPOSITORY) private readonly priceReferenceRepository: PriceReferenceRepository,
  ) {}

  /** Preço sugerido por caixa, ou null quando não há cotação de referência para o produto. */
  async suggestPricePerBox({ crop, grade, boxWeightKg }: PriceSuggestionInput): Promise<number | null> {
    if (GRADE_PRICE_FACTORS[grade] === 0) return null;
    const reference = await this.priceReferenceRepository.findLatestByCrop(PriceReference.normalizeCrop(crop));
    if (!reference) return null;
    const pricePerBox = reference.pricePerKg * boxWeightKg * GRADE_PRICE_FACTORS[grade];
    return Math.round(pricePerBox * 100) / 100;
  }
}

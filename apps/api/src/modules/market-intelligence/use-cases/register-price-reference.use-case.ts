import { Inject, Injectable } from '@nestjs/common';
import { PriceReference, PriceReferenceProps } from '../entities/price-reference.entity';
import { PRICE_REFERENCE_REPOSITORY, PriceReferenceRepository } from '../repositories/price-reference.repository';

/** Registra cotações de referência (importação manual no MVP; job diário CONAB/CEASA na v1). */
@Injectable()
export class RegisterPriceReferenceUseCase {
  constructor(
    @Inject(PRICE_REFERENCE_REPOSITORY) private readonly priceReferenceRepository: PriceReferenceRepository,
  ) {}

  async execute(references: PriceReferenceProps[]): Promise<number> {
    for (const referenceProps of references) {
      await this.priceReferenceRepository.save(PriceReference.create(referenceProps));
    }
    return references.length;
  }
}

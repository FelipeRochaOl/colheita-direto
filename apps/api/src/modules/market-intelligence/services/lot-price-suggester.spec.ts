import { PriceReference } from '../entities/price-reference.entity';
import { PriceReferenceRepository } from '../repositories/price-reference.repository';
import { LotPriceSuggester } from './lot-price-suggester';

class SingleReferenceRepository implements PriceReferenceRepository {
  async findLatestByCrop(normalizedCrop: string) {
    return normalizedCrop === 'tomate'
      ? PriceReference.create({ crop: 'tomate', pricePerKg: 4, source: 'teste', referenceDate: new Date() })
      : null;
  }
  async save() {}
}

describe('LotPriceSuggester', () => {
  const suggester = new LotPriceSuggester(new SingleReferenceRepository());

  it('preço da caixa = referência por kg × peso × fator da classe', async () => {
    await expect(suggester.suggestPricePerBox({ crop: 'Tomate', grade: 'A', boxWeightKg: 20 })).resolves.toBe(80);
    await expect(suggester.suggestPricePerBox({ crop: 'tomate', grade: 'B', boxWeightKg: 20 })).resolves.toBe(60);
  });

  it('lote D não recebe preço (não vai para venda)', async () => {
    await expect(suggester.suggestPricePerBox({ crop: 'tomate', grade: 'D', boxWeightKg: 20 })).resolves.toBeNull();
  });

  it('sem cotação de referência não sugere preço', async () => {
    await expect(suggester.suggestPricePerBox({ crop: 'jiló', grade: 'A', boxWeightKg: 20 })).resolves.toBeNull();
  });
});

export interface PriceReferenceProps {
  crop: string;
  pricePerKg: number;
  source: string;
  referenceDate: Date;
}

/** Cotação de referência de um produto (ex.: CONAB/Prohort, CEASA) em R$/kg. */
export class PriceReference {
  private constructor(private readonly props: PriceReferenceProps) {}

  static create(props: PriceReferenceProps): PriceReference {
    if (props.pricePerKg <= 0) throw new Error('Preço de referência deve ser positivo');
    return new PriceReference({ ...props, crop: PriceReference.normalizeCrop(props.crop) });
  }

  static restore(props: PriceReferenceProps): PriceReference {
    return new PriceReference(props);
  }

  static normalizeCrop(crop: string): string {
    return crop
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  get crop() {
    return this.props.crop;
  }
  get pricePerKg() {
    return this.props.pricePerKg;
  }

  toSnapshot(): PriceReferenceProps {
    return { ...this.props };
  }
}

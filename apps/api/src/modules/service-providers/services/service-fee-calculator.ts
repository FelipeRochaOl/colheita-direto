import { Injectable } from '@nestjs/common';

/** Tabela de referência do MVP. Valida-se no piloto e depois passa a vir de cada prestador. */
const FREIGHT_BASE_FEE = 25;
const FREIGHT_FEE_PER_KM = 1.8;
const REFRIGERATED_FREIGHT_MULTIPLIER = 1.3;
const COLD_STORAGE_FEE_PER_BOX = 1.5;
const PACKING_FEE_PER_BOX = 2;

export interface ServiceFeeInput {
  distanceKm: number;
  boxes: number;
  needsRefrigeration: boolean;
}

@Injectable()
export class ServiceFeeCalculator {
  calculateFreightFee({ distanceKm, needsRefrigeration }: ServiceFeeInput): number {
    const fee = FREIGHT_BASE_FEE + distanceKm * FREIGHT_FEE_PER_KM;
    return this.roundToCents(needsRefrigeration ? fee * REFRIGERATED_FREIGHT_MULTIPLIER : fee);
  }

  calculateColdStorageFee({ boxes }: ServiceFeeInput): number {
    return this.roundToCents(boxes * COLD_STORAGE_FEE_PER_BOX);
  }

  calculatePackingFee({ boxes }: ServiceFeeInput): number {
    return this.roundToCents(boxes * PACKING_FEE_PER_BOX);
  }

  private roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

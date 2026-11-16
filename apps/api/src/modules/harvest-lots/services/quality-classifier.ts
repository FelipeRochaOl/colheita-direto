import type { LotClassification } from '@colheita/contracts';

export const QUALITY_CLASSIFIER = Symbol('QUALITY_CLASSIFIER');

export interface QualityClassificationRequest {
  crop: string;
  photoUrls: string[];
  boxWeightKg: number;
}

/** Porta para o serviço de visão computacional (services/vision). */
export interface QualityClassifier {
  classify(request: QualityClassificationRequest): Promise<LotClassification>;
}

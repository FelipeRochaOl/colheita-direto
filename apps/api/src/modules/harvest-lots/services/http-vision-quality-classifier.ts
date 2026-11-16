import { Injectable } from '@nestjs/common';
import { lotClassificationSchema } from '@colheita/contracts';
import type { LotClassification } from '@colheita/contracts';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { QualityClassificationRequest, QualityClassifier } from './quality-classifier';

/** Chama o serviço FastAPI de visão. Contrato em services/vision/app/schemas/quality_schemas.py. */
@Injectable()
export class HttpVisionQualityClassifier implements QualityClassifier {
  constructor(private readonly appConfig: AppConfigService) {}

  async classify(request: QualityClassificationRequest): Promise<LotClassification> {
    const response = await fetch(`${this.appConfig.get('VISION_SERVICE_URL')}/quality/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: request.crop,
        photo_urls: request.photoUrls,
        box_weight_kg: request.boxWeightKg,
      }),
    });
    if (!response.ok) {
      throw new Error(`Serviço de visão respondeu ${response.status}: ${await response.text()}`);
    }
    const body = await response.json();
    return lotClassificationSchema.parse({
      grade: body.grade,
      confidence: body.confidence,
      defects: body.defects,
      estimatedWeightKg: body.estimated_weight_kg,
      classifierName: body.classifier_name,
    });
  }
}

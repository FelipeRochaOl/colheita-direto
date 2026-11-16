import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { PHOTO_STORAGE, PhotoStorage } from '../../../shared/storage/photo-storage';
import { USER_REPOSITORY, UserRepository } from '../../identity/repositories/user.repository';
import { LotPriceSuggester } from '../../market-intelligence/services/lot-price-suggester';
import { NotificationService } from '../../notifications/services/notification.service';
import { HarvestLot } from '../entities/harvest-lot.entity';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../repositories/harvest-lot.repository';
import { LotDestinationPolicy } from '../services/lot-destination-policy';
import { QUALITY_CLASSIFIER, QualityClassifier } from '../services/quality-classifier';
import { LotClassificationMessageBuilder } from '../services/lot-classification-message-builder';

/** Executado pelo worker: foto → visão computacional → classe A–D → destino e preço sugeridos → aviso ao produtor. */
@Injectable()
export class ClassifyHarvestLotUseCase {
  constructor(
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    @Inject(QUALITY_CLASSIFIER) private readonly qualityClassifier: QualityClassifier,
    @Inject(PHOTO_STORAGE) private readonly photoStorage: PhotoStorage,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly lotDestinationPolicy: LotDestinationPolicy,
    private readonly lotPriceSuggester: LotPriceSuggester,
    private readonly notificationService: NotificationService,
    private readonly messageBuilder: LotClassificationMessageBuilder,
  ) {}

  async execute(harvestLotId: string): Promise<HarvestLot> {
    const harvestLot = await this.harvestLotRepository.findById(harvestLotId);
    if (!harvestLot) throw new EntityNotFoundError('Lote', harvestLotId);
    if (harvestLot.status !== 'PENDING_CLASSIFICATION') return harvestLot;

    const photoUrls = await Promise.all(
      harvestLot.photoKeys.map((photoKey) => this.photoStorage.createReadUrl(photoKey)),
    );
    const classification = await this.qualityClassifier.classify({
      crop: harvestLot.crop,
      photoUrls,
      boxWeightKg: harvestLot.boxWeightKg,
    });
    const recommendedDestination = this.lotDestinationPolicy.recommendDestination(classification.grade);
    const suggestedPricePerBox = await this.lotPriceSuggester.suggestPricePerBox({
      crop: harvestLot.crop,
      grade: classification.grade,
      boxWeightKg: harvestLot.boxWeightKg,
    });

    harvestLot.applyClassification(classification, recommendedDestination, suggestedPricePerBox);
    await this.harvestLotRepository.save(harvestLot);

    const producerUser = await this.userRepository.findById(harvestLot.producerId);
    if (producerUser) {
      await this.notificationService.notify(
        producerUser.toNotificationRecipient(),
        this.messageBuilder.build(harvestLot),
      );
    }
    return harvestLot;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { ConfirmLotDestinationInput, LotDestination } from '@colheita/contracts';
import {
  AccessDeniedError,
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../shared/errors/domain-error';
import { HarvestLot } from '../../harvest-lots/entities/harvest-lot.entity';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../../harvest-lots/repositories/harvest-lot.repository';
import { LotDestinationPolicy } from '../../harvest-lots/services/lot-destination-policy';
import { PublishOfferUseCase } from '../../marketplace/use-cases/publish-offer.use-case';
import { OfferDonationUseCase } from '../../surplus/use-cases/offer-donation.use-case';

export interface LotDestinationResult {
  harvestLotId: string;
  destination: LotDestination;
  offerId: string | null;
  donationId: string | null;
}

/**
 * O produtor confirma o destino (app ou WhatsApp) e o lote segue para o canal certo:
 * marketplace/indústria → oferta; doação → ONGs próximas; ração/compostagem → registrado como descarte útil.
 */
@Injectable()
export class ConfirmLotDestinationUseCase {
  constructor(
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
    private readonly lotDestinationPolicy: LotDestinationPolicy,
    private readonly publishOfferUseCase: PublishOfferUseCase,
    private readonly offerDonationUseCase: OfferDonationUseCase,
  ) {}

  async execute(
    producerId: string,
    harvestLotId: string,
    input: ConfirmLotDestinationInput,
  ): Promise<LotDestinationResult> {
    const harvestLot = await this.harvestLotRepository.findById(harvestLotId);
    if (!harvestLot) throw new EntityNotFoundError('Lote', harvestLotId);
    if (!harvestLot.isOwnedBy(producerId)) throw new AccessDeniedError('Este lote é de outro produtor');
    const grade = harvestLot.classification?.grade;
    if (!grade) throw new BusinessRuleViolationError('Aguarde a classificação do lote');
    if (!this.lotDestinationPolicy.allowedDestinations(grade).includes(input.destination)) {
      throw new BusinessRuleViolationError(`Lote classe ${grade} não pode ir para ${input.destination}`);
    }
    if (input.destination === 'AUCTION') {
      throw new BusinessRuleViolationError('Leilão de excedente chega na próxima versão');
    }

    harvestLot.confirmDestination(input.destination);
    const result = await this.sendToDestination(harvestLot, input);
    await this.harvestLotRepository.save(harvestLot);
    return result;
  }

  private async sendToDestination(
    harvestLot: HarvestLot,
    input: ConfirmLotDestinationInput,
  ): Promise<LotDestinationResult> {
    const result: LotDestinationResult = {
      harvestLotId: harvestLot.id,
      destination: input.destination,
      offerId: null,
      donationId: null,
    };

    if (input.destination === 'MARKETPLACE' || input.destination === 'DISCOUNT_MARKETPLACE' || input.destination === 'INDUSTRY') {
      const pricePerBox = input.pricePerBox ?? harvestLot.suggestedPricePerBox;
      if (!pricePerBox) throw new BusinessRuleViolationError('Informe o preço por caixa');
      const offer = await this.publishOfferUseCase.execute({
        harvestLotId: harvestLot.id,
        producerId: harvestLot.producerId,
        crop: harvestLot.crop,
        grade: harvestLot.classification!.grade,
        channel: input.destination,
        boxes: harvestLot.quantityBoxes,
        boxWeightKg: harvestLot.boxWeightKg,
        pricePerBox,
        photoKeys: harvestLot.photoKeys,
      });
      result.offerId = offer.id;
    }

    if (input.destination === 'DONATION') {
      const donation = await this.offerDonationUseCase.execute({
        harvestLotId: harvestLot.id,
        producerId: harvestLot.producerId,
        crop: harvestLot.crop,
        quantityBoxes: harvestLot.quantityBoxes,
        estimatedWeightKg: harvestLot.totalWeightKg,
      });
      result.donationId = donation.id;
    }
    return result;
  }
}

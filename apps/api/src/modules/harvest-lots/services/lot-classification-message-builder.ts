import { Injectable } from '@nestjs/common';
import type { LotDestination } from '@colheita/contracts';
import { NotificationMessage } from '../../notifications/notification-message';
import { HarvestLot } from '../entities/harvest-lot.entity';

const DESTINATION_DESCRIPTIONS: Record<LotDestination, string> = {
  MARKETPLACE: 'vender no marketplace pelo preço cheio',
  DISCOUNT_MARKETPLACE: 'vender no marketplace com desconto',
  AUCTION: 'colocar em leilão',
  INDUSTRY: 'vender para a indústria (polpa, molho, desidratados)',
  DONATION: 'doar para um banco de alimentos próximo',
  ANIMAL_FEED: 'destinar para ração animal (somente vegetal)',
  COMPOST: 'destinar para compostagem',
};

/** Mensagem curta e em linguagem simples que o produtor recebe após a classificação. */
@Injectable()
export class LotClassificationMessageBuilder {
  build(harvestLot: HarvestLot): NotificationMessage {
    const classification = harvestLot.classification!;
    const destination = harvestLot.recommendedDestination!;
    const priceText = harvestLot.suggestedPricePerBox
      ? ` Preço sugerido: R$ ${harvestLot.suggestedPricePerBox.toFixed(2).replace('.', ',')} a caixa.`
      : '';
    const reviewText =
      harvestLot.status === 'NEEDS_REVIEW' ? ' Não tenho certeza da classe: confira as fotos antes de confirmar.' : '';
    const text =
      `Seu lote de ${harvestLot.quantityBoxes} caixas de ${harvestLot.crop} ficou classe ${classification.grade}.` +
      `${priceText} Sugestão: ${DESTINATION_DESCRIPTIONS[destination]}.${reviewText}`;

    return {
      text,
      buttons: [
        { id: `confirm-destination:${harvestLot.id}:${destination}`, title: 'Confirmar' },
        { id: `choose-destination:${harvestLot.id}`, title: 'Outro destino' },
      ],
      template: {
        name: 'lote_classificado',
        languageCode: 'pt_BR',
        bodyParameters: [harvestLot.crop, classification.grade, DESTINATION_DESCRIPTIONS[destination]],
      },
    };
  }
}

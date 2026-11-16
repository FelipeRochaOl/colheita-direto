import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { USER_REPOSITORY, UserRepository } from '../../identity/repositories/user.repository';
import { NotificationService } from '../../notifications/services/notification.service';
import { PRODUCER_REPOSITORY, ProducerRepository } from '../../producers/repositories/producer.repository';
import { Donation } from '../entities/donation.entity';
import { DONATION_REPOSITORY, DonationRepository } from '../repositories/donation.repository';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

const NGO_SEARCH_RADIUS_KM = 100;

export interface OfferDonationInput {
  harvestLotId: string;
  producerId: string;
  crop: string;
  quantityBoxes: number;
  estimatedWeightKg: number;
}

/** Cria a doação e avisa as ONGs aprovadas que retiram na região do produtor. */
@Injectable()
export class OfferDonationUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY) private readonly donationRepository: DonationRepository,
    @Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository,
    @Inject(PRODUCER_REPOSITORY) private readonly producerRepository: ProducerRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(input: OfferDonationInput): Promise<Donation> {
    const producer = await this.producerRepository.findById(input.producerId);
    if (!producer) throw new EntityNotFoundError('Produtor', input.producerId);

    const donation = Donation.offer({
      harvestLotId: input.harvestLotId,
      producerId: producer.id,
      producerName: producer.name,
      crop: input.crop,
      quantityBoxes: input.quantityBoxes,
      estimatedWeightKg: input.estimatedWeightKg,
      pickupLocation: producer.farmLocation,
    });
    await this.donationRepository.save(donation);

    const nearbyNgos = await this.ngoRepository.findApprovedNear(producer.farmLocation, NGO_SEARCH_RADIUS_KM);
    for (const ngo of nearbyNgos) {
      const ngoUser = await this.userRepository.findById(ngo.id);
      if (!ngoUser) continue;
      await this.notificationService.notify(ngoUser.toNotificationRecipient(), {
        text: `Doação disponível: ${input.quantityBoxes} caixas de ${input.crop} (~${Math.round(input.estimatedWeightKg)} kg) em ${producer.city}/${producer.state}. Aceite pelo painel.`,
        template: {
          name: 'doacao_disponivel',
          languageCode: 'pt_BR',
          bodyParameters: [input.crop, String(Math.round(input.estimatedWeightKg)), producer.city],
        },
      });
    }
    return donation;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { AccessDeniedError, EntityNotFoundError } from '../../../shared/errors/domain-error';
import { USER_REPOSITORY, UserRepository } from '../../identity/repositories/user.repository';
import { NotificationService } from '../../notifications/services/notification.service';
import { DONATION_REPOSITORY, DonationRepository } from '../repositories/donation.repository';
import { NGO_REPOSITORY, NgoRepository } from '../repositories/ngo.repository';

@Injectable()
export class AcceptDonationUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY) private readonly donationRepository: DonationRepository,
    @Inject(NGO_REPOSITORY) private readonly ngoRepository: NgoRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(ngoId: string, donationId: string): Promise<void> {
    const ngo = await this.ngoRepository.findById(ngoId);
    if (!ngo?.isApproved) throw new AccessDeniedError('Organização ainda não aprovada');
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) throw new EntityNotFoundError('Doação', donationId);

    donation.acceptBy(ngoId);
    await this.donationRepository.save(donation);

    const producerUser = await this.userRepository.findById(donation.producerId);
    if (producerUser) {
      await this.notificationService.notify(producerUser.toNotificationRecipient(), {
        text: `${ngo.name} aceitou sua doação e vai combinar a retirada. Obrigado por evitar o desperdício!`,
      });
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { ConfirmDonationReceiptInput } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { HARVEST_LOT_REPOSITORY, HarvestLotRepository } from '../../harvest-lots/repositories/harvest-lot.repository';
import { DONATION_REPOSITORY, DonationRepository } from '../repositories/donation.repository';

/** Comprovante de recebimento pela ONG: alimenta o indicador de kg doados. */
@Injectable()
export class ConfirmDonationReceiptUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY) private readonly donationRepository: DonationRepository,
    @Inject(HARVEST_LOT_REPOSITORY) private readonly harvestLotRepository: HarvestLotRepository,
  ) {}

  async execute(ngoId: string, donationId: string, input: ConfirmDonationReceiptInput): Promise<void> {
    const donation = await this.donationRepository.findById(donationId);
    if (!donation) throw new EntityNotFoundError('Doação', donationId);
    donation.confirmReceipt(ngoId, input.receivedWeightKg);
    await this.donationRepository.save(donation);

    const harvestLot = await this.harvestLotRepository.findById(donation.harvestLotId);
    if (harvestLot) {
      harvestLot.markDonated();
      await this.harvestLotRepository.save(harvestLot);
    }
  }
}

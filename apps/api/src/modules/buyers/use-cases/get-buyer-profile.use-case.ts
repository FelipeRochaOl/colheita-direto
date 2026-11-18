import { Inject, Injectable } from '@nestjs/common';
import type { BuyerProfile } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { BUYER_REPOSITORY, BuyerRepository } from '../repositories/buyer.repository';

@Injectable()
export class GetBuyerProfileUseCase {
  constructor(@Inject(BUYER_REPOSITORY) private readonly buyerRepository: BuyerRepository) {}

  async execute(buyerId: string): Promise<BuyerProfile> {
    const buyer = await this.buyerRepository.findById(buyerId);
    if (!buyer) throw new EntityNotFoundError('Comprador', buyerId);
    // Só o que a tela "Meus dados" mostra; ids do gateway de pagamento ficam no servidor
    const { id, name, buyerType, document, phoneNumber, deliveryLocation, deliveryAddress } = buyer.toSnapshot();
    return { id, name, buyerType, document, phoneNumber, deliveryLocation, deliveryAddress };
  }
}

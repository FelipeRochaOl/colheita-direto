import type { AuthSession } from '@colheita/contracts';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { Buyer } from '../entities/buyer.entity';
import { BuyerRepository } from '../repositories/buyer.repository';
import { UpdateBuyerProfileUseCase } from './update-buyer-profile.use-case';

class InMemoryBuyerRepository implements BuyerRepository {
  readonly buyers = new Map<string, Buyer>();
  async findById(buyerId: string) {
    return this.buyers.get(buyerId) ?? null;
  }
  async save(buyer: Buyer) {
    this.buyers.set(buyer.id, buyer);
  }
}

describe('UpdateBuyerProfileUseCase', () => {
  it('atualiza entrega e nome sem tocar no documento nem no cliente de pagamento', async () => {
    const buyerRepository = new InMemoryBuyerRepository();
    const renameUser = { execute: jest.fn().mockResolvedValue({} as AuthSession) };
    const buyer = Buyer.register({
      id: 'buyer-1',
      name: 'Restaurante',
      buyerType: 'RESTAURANT',
      document: '12345678000199',
      phoneNumber: '+5511900000201',
      deliveryLocation: { latitude: -23.5, longitude: -46.6 },
      deliveryAddress: 'Rua A, 1',
    });
    buyer.linkPaymentCustomer('cus_1');
    await buyerRepository.save(buyer);

    await new UpdateBuyerProfileUseCase(buyerRepository, renameUser as unknown as RenameUserUseCase).execute('buyer-1', {
      name: 'Restaurante Novo',
      buyerType: 'RETAIL',
      deliveryLocation: { latitude: -23.4, longitude: -46.5 },
      deliveryAddress: 'Rua B, 2',
    });

    const saved = (await buyerRepository.findById('buyer-1'))!.toSnapshot();
    expect(saved).toMatchObject({
      name: 'Restaurante Novo',
      buyerType: 'RETAIL',
      deliveryAddress: 'Rua B, 2',
      document: '12345678000199',
      phoneNumber: '+5511900000201',
      paymentCustomerId: 'cus_1',
    });
    expect(renameUser.execute).toHaveBeenCalledWith('buyer-1', 'Restaurante Novo');
  });
});

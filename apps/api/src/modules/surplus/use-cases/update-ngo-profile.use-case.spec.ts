import type { AuthSession } from '@colheita/contracts';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { Ngo } from '../entities/ngo.entity';
import { NgoRepository } from '../repositories/ngo.repository';
import { UpdateNgoProfileUseCase } from './update-ngo-profile.use-case';

class InMemoryNgoRepository implements NgoRepository {
  readonly ngos = new Map<string, Ngo>();
  async findById(ngoId: string) {
    return this.ngos.get(ngoId) ?? null;
  }
  async findApprovedNear() {
    return [];
  }
  async save(ngo: Ngo) {
    this.ngos.set(ngo.id, ngo);
  }
}

describe('UpdateNgoProfileUseCase', () => {
  it('atualiza endereço e raio mantendo CNPJ e aprovação', async () => {
    const ngoRepository = new InMemoryNgoRepository();
    const renameUser = { execute: jest.fn().mockResolvedValue({} as AuthSession) };
    const ngo = Ngo.register({
      id: 'ngo-1',
      name: 'Banco de Alimentos',
      document: '11222333000144',
      phoneNumber: '+5511900000301',
      location: { latitude: -23.5, longitude: -46.6 },
      address: 'Rua C, 3',
      pickupRadiusKm: 50,
    });
    ngo.approve();
    await ngoRepository.save(ngo);

    await new UpdateNgoProfileUseCase(ngoRepository, renameUser as unknown as RenameUserUseCase).execute('ngo-1', {
      name: 'Banco de Alimentos Zona Leste',
      location: { latitude: -23.55, longitude: -46.45 },
      address: 'Rua D, 4',
      pickupRadiusKm: 80,
    });

    const saved = (await ngoRepository.findById('ngo-1'))!.toSnapshot();
    expect(saved).toMatchObject({
      name: 'Banco de Alimentos Zona Leste',
      address: 'Rua D, 4',
      pickupRadiusKm: 80,
      document: '11222333000144',
      isApproved: true,
    });
    expect(renameUser.execute).toHaveBeenCalledWith('ngo-1', 'Banco de Alimentos Zona Leste');
  });
});

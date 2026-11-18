import type { AuthSession } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import { Producer } from '../entities/producer.entity';
import { ProducerRepository } from '../repositories/producer.repository';
import { UpdateProducerProfileUseCase } from './update-producer-profile.use-case';

class InMemoryProducerRepository implements ProducerRepository {
  readonly producers = new Map<string, Producer>();
  async findById(producerId: string) {
    return this.producers.get(producerId) ?? null;
  }
  async findManyByIds(producerIds: string[]) {
    return producerIds.flatMap((id) => this.producers.get(id) ?? []);
  }
  async save(producer: Producer) {
    this.producers.set(producer.id, producer);
  }
  async countAll() {
    return this.producers.size;
  }
}

const FAKE_SESSION = { accessToken: 'a', refreshToken: 'r' } as AuthSession;

function setup() {
  const producerRepository = new InMemoryProducerRepository();
  const renameUser = { execute: jest.fn().mockResolvedValue(FAKE_SESSION) };
  const useCase = new UpdateProducerProfileUseCase(producerRepository, renameUser as unknown as RenameUserUseCase);
  return { producerRepository, renameUser, useCase };
}

const NEW_DATA = {
  name: 'João Silva Neto',
  farmName: 'Sítio Novo',
  farmLocation: { latitude: -23.1, longitude: -46.1 },
  city: 'Suzano',
  state: 'sp',
  crops: ['alface'],
  familyFarmRegistration: '  ',
};

describe('UpdateProducerProfileUseCase', () => {
  it('atualiza o perfil, normaliza UF/CAF e renomeia a conta', async () => {
    const { producerRepository, renameUser, useCase } = setup();
    await producerRepository.save(
      Producer.register({
        id: 'producer-1',
        name: 'João',
        farmName: 'Sítio Velho',
        farmLocation: { latitude: -23.5, longitude: -46.2 },
        city: 'Mogi',
        state: 'SP',
        crops: ['tomate'],
        familyFarmRegistration: 'CAF-1',
      }),
    );

    const session = await useCase.execute('producer-1', NEW_DATA);

    const saved = (await producerRepository.findById('producer-1'))!.toSnapshot();
    expect(saved).toMatchObject({ name: 'João Silva Neto', farmName: 'Sítio Novo', city: 'Suzano', state: 'SP', crops: ['alface'] });
    expect(saved.familyFarmRegistration).toBeNull();
    expect(renameUser.execute).toHaveBeenCalledWith('producer-1', 'João Silva Neto');
    expect(session).toBe(FAKE_SESSION);
  });

  it('falha quando o produtor não existe', async () => {
    const { useCase, renameUser } = setup();
    await expect(useCase.execute('nao-existe', NEW_DATA)).rejects.toBeInstanceOf(EntityNotFoundError);
    expect(renameUser.execute).not.toHaveBeenCalled();
  });
});

import { BusinessRuleViolationError, EntityNotFoundError } from '../../../shared/errors/domain-error';
import { UserRepository } from '../../identity/repositories/user.repository';
import { ServiceRequestPresenter } from '../services/service-request-presenter';
import {
  buildProducer,
  buildTransporter,
  InMemoryProducerRepository,
  InMemoryServiceProviderRepository,
  InMemoryServiceRequestRepository,
} from '../testing/service-provider-test-doubles';
import { CreateServiceRequestUseCase } from './create-service-request.use-case';
import { ListServiceRequestsUseCase } from './list-service-requests.use-case';
import { RespondServiceRequestUseCase } from './respond-service-request.use-case';

async function setup() {
  const producerRepository = new InMemoryProducerRepository();
  const serviceProviderRepository = new InMemoryServiceProviderRepository();
  const serviceRequestRepository = new InMemoryServiceRequestRepository();
  const userRepository = {
    findById: jest.fn(async (id: string) => ({ id, phoneNumber: '+5511911112222' })),
  } as unknown as UserRepository;
  const presenter = new ServiceRequestPresenter(producerRepository, serviceProviderRepository, userRepository);
  await producerRepository.save(buildProducer());
  await serviceProviderRepository.save(buildTransporter());
  return {
    serviceProviderRepository,
    serviceRequestRepository,
    create: new CreateServiceRequestUseCase(
      producerRepository,
      serviceProviderRepository,
      serviceRequestRepository,
      presenter,
    ),
    respond: new RespondServiceRequestUseCase(serviceRequestRepository, presenter),
    list: new ListServiceRequestsUseCase(serviceRequestRepository, presenter),
  };
}

const TRIP = { serviceProviderId: 'provider-1', serviceType: 'TRANSPORT' as const, quantity: 40 };

describe('Contratação de serviço', () => {
  it('produtor solicita; os dois veem a solicitação com o preço estimado', async () => {
    const { create, list } = await setup();

    const request = await create.execute('producer-1', { ...TRIP, notes: ' 20 caixas de tomate ' });

    expect(request).toMatchObject({
      status: 'REQUESTED',
      estimatedTotal: 130,
      producerName: 'João',
      serviceProviderName: 'Transportes provider-1',
      notes: '20 caixas de tomate',
      counterpartPhoneNumber: null,
    });
    expect((await list.execute('producer-1')).sent).toHaveLength(1);
    expect((await list.execute('provider-1')).received).toHaveLength(1);
  });

  it('recusa prestador que não atende a fazenda, não oferece o serviço ou não foi aprovado', async () => {
    const { create, serviceProviderRepository } = await setup();
    await serviceProviderRepository.save(buildTransporter({ id: 'longe', serviceRadiusKm: 20 }));
    await serviceProviderRepository.save(buildTransporter({ id: 'pendente', approved: false }));

    await expect(create.execute('producer-1', { ...TRIP, serviceProviderId: 'longe' })).rejects.toBeInstanceOf(
      BusinessRuleViolationError,
    );
    await expect(create.execute('producer-1', { ...TRIP, serviceProviderId: 'pendente' })).rejects.toBeInstanceOf(
      BusinessRuleViolationError,
    );
    await expect(create.execute('producer-1', { ...TRIP, serviceType: 'PACKING' })).rejects.toBeInstanceOf(
      BusinessRuleViolationError,
    );
  });

  it('prestador aceita e o celular de cada um é liberado para o outro', async () => {
    const { create, respond, list } = await setup();
    const { id } = await create.execute('producer-1', TRIP);

    const accepted = await respond.execute('provider-1', id, true);

    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.counterpartPhoneNumber).toBe('+5511911112222');
    expect((await list.execute('producer-1')).sent[0].counterpartPhoneNumber).toBe('+5511988887777');
  });

  it('prestador recusa; responder de novo é regra violada', async () => {
    const { create, respond } = await setup();
    const { id } = await create.execute('producer-1', TRIP);

    expect((await respond.execute('provider-1', id, false)).status).toBe('DECLINED');
    await expect(respond.execute('provider-1', id, true)).rejects.toBeInstanceOf(BusinessRuleViolationError);
  });

  it('outro prestador não consegue responder solicitação alheia', async () => {
    const { create, respond } = await setup();
    const { id } = await create.execute('producer-1', TRIP);

    await expect(respond.execute('provider-2', id, true)).rejects.toBeInstanceOf(EntityNotFoundError);
  });
});

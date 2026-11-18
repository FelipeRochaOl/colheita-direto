import { updateServiceProviderProfileSchema } from '@colheita/contracts';
import type { AuthSession } from '@colheita/contracts';
import { RenameUserUseCase } from '../../identity/use-cases/rename-user.use-case';
import {
  buildProducer,
  buildTransporter,
  InMemoryProducerRepository,
  InMemoryServiceProviderRepository,
} from '../testing/service-provider-test-doubles';
import { GetServiceProviderProfileUseCase } from './get-service-provider-profile.use-case';
import { SearchServiceProvidersUseCase } from './search-service-providers.use-case';
import { UpdateServiceProviderProfileUseCase } from './update-service-provider-profile.use-case';

const FAKE_SESSION = { accessToken: 'a', refreshToken: 'r' } as AuthSession;

const PUBLISHED_PRICES = {
  name: 'Fretes Alto Tietê',
  offerings: [
    { serviceType: 'TRANSPORT' as const, price: 2.5, baseFee: 30, description: 'Caminhão baú 3 t' },
    { serviceType: 'PACKING' as const, price: 1.2, baseFee: 99 },
  ],
  baseLocation: { latitude: -23.86, longitude: -46.2 },
  serviceRadiusKm: 80,
  vehicleCapacityKg: 3000,
  hasRefrigeration: true,
};

describe('Divulgação de serviços pelo prestador', () => {
  function setup() {
    const serviceProviderRepository = new InMemoryServiceProviderRepository();
    const renameUser = { execute: jest.fn().mockResolvedValue(FAKE_SESSION) };
    const update = new UpdateServiceProviderProfileUseCase(
      serviceProviderRepository,
      renameUser as unknown as RenameUserUseCase,
    );
    const get = new GetServiceProviderProfileUseCase(serviceProviderRepository);
    return { serviceProviderRepository, renameUser, update, get };
  }

  it('publica preços, raio e base; tipos atendidos passam a ser os serviços com preço', async () => {
    const { serviceProviderRepository, renameUser, update, get } = setup();
    await serviceProviderRepository.save(buildTransporter({ withPrice: false }));

    const session = await update.execute('provider-1', PUBLISHED_PRICES);

    const profile = await get.execute('provider-1');
    expect(profile).toMatchObject({ name: 'Fretes Alto Tietê', serviceRadiusKm: 80, hasRefrigeration: true });
    expect(profile.offerings).toEqual([
      { serviceType: 'TRANSPORT', price: 2.5, baseFee: 30, description: 'Caminhão baú 3 t' },
      // Taxa de saída só vale para frete
      { serviceType: 'PACKING', price: 1.2, baseFee: 0 },
    ]);
    const provider = (await serviceProviderRepository.findById('provider-1'))!;
    expect(provider.offers('PACKING')).toBe(true);
    expect(provider.estimatePrice('TRANSPORT', 40)).toBe(130);
    expect(renameUser.execute).toHaveBeenCalledWith('provider-1', 'Fretes Alto Tietê');
    expect(session).toBe(FAKE_SESSION);
  });

  it('rejeita serviço sem preço e serviço repetido (validação do contrato)', () => {
    const withoutPrice = updateServiceProviderProfileSchema.safeParse({
      ...PUBLISHED_PRICES,
      offerings: [{ serviceType: 'PACKING' }],
    });
    const repeated = updateServiceProviderProfileSchema.safeParse({
      ...PUBLISHED_PRICES,
      offerings: [PUBLISHED_PRICES.offerings[0], PUBLISHED_PRICES.offerings[0]],
    });
    const empty = updateServiceProviderProfileSchema.safeParse({ ...PUBLISHED_PRICES, offerings: [] });
    expect(withoutPrice.success).toBe(false);
    expect(repeated.success).toBe(false);
    expect(empty.success).toBe(false);
  });
});

describe('Busca de prestadores pelo produtor', () => {
  async function setup() {
    const producerRepository = new InMemoryProducerRepository();
    const serviceProviderRepository = new InMemoryServiceProviderRepository();
    await producerRepository.save(buildProducer());
    const search = new SearchServiceProvidersUseCase(producerRepository, serviceProviderRepository);
    return { serviceProviderRepository, search };
  }

  it('lista quem atende a fazenda com estimativa taxa de saída + km × preço', async () => {
    const { serviceProviderRepository, search } = await setup();
    await serviceProviderRepository.save(buildTransporter());

    const [found, ...others] = await search.execute('producer-1', { serviceType: 'TRANSPORT', quantity: 40 });

    expect(others).toHaveLength(0);
    expect(found).toMatchObject({ serviceProviderId: 'provider-1', price: 2.5, baseFee: 30, estimatedTotal: 130 });
    expect(found.distanceKm).toBeGreaterThan(35);
    expect(found.distanceKm).toBeLessThan(45);
  });

  it('esconde prestador fora do raio, não aprovado ou sem preço divulgado', async () => {
    const { serviceProviderRepository, search } = await setup();
    await serviceProviderRepository.save(buildTransporter({ id: 'longe', serviceRadiusKm: 20 }));
    await serviceProviderRepository.save(buildTransporter({ id: 'pendente', approved: false }));
    await serviceProviderRepository.save(buildTransporter({ id: 'sem-preco', withPrice: false }));

    expect(await search.execute('producer-1', { serviceType: 'TRANSPORT', quantity: 40 })).toEqual([]);
  });

  it('ordena do mais barato para o mais caro', async () => {
    const { serviceProviderRepository, search } = await setup();
    const expensive = buildTransporter({ id: 'caro' });
    expensive.updateProfile({
      ...expensive.toSnapshot(),
      offerings: [{ serviceType: 'TRANSPORT', price: 5, baseFee: 50, description: null }],
    });
    await serviceProviderRepository.save(expensive);
    await serviceProviderRepository.save(buildTransporter({ id: 'barato' }));

    const results = await search.execute('producer-1', { serviceType: 'TRANSPORT', quantity: 10 });
    expect(results.map((result) => result.serviceProviderId)).toEqual(['barato', 'caro']);
  });
});

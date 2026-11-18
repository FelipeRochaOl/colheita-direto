import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import { ServiceFeeCalculator } from '../../service-providers/services/service-fee-calculator';
import {
  buildTransporter,
  FARM_LOCATION,
  InMemoryServiceProviderRepository,
} from '../../service-providers/testing/service-provider-test-doubles';
import { IntermediaryServicePlanner } from './intermediary-service-planner';

const DELIVERY = { latitude: -23.55, longitude: -46.63 };

async function planFreightWith(withPrice: boolean) {
  const serviceProviderRepository = new InMemoryServiceProviderRepository();
  await serviceProviderRepository.save(buildTransporter({ withPrice }));
  const planner = new IntermediaryServicePlanner(serviceProviderRepository, new ServiceFeeCalculator());
  const [charge] = await planner.planServices({
    deliveryMode: 'PLATFORM_FREIGHT',
    extraServices: [],
    pickupLocation: FARM_LOCATION,
    deliveryLocation: DELIVERY,
    boxes: 10,
  });
  return charge;
}

describe('IntermediaryServicePlanner — frete', () => {
  const distanceKm = calculateDistanceKm(FARM_LOCATION, DELIVERY);

  it('usa a taxa de saída e o R$/km divulgados pelo prestador', async () => {
    const charge = await planFreightWith(true);
    expect(charge).toMatchObject({ serviceType: 'TRANSPORT', serviceProviderId: 'provider-1' });
    expect(charge.amount).toBeCloseTo(30 + 2.5 * distanceKm, 1);
  });

  it('cai na tabela de referência quando o prestador não divulgou preço', async () => {
    const charge = await planFreightWith(false);
    expect(charge.amount).toBeCloseTo(25 + 1.8 * distanceKm, 1);
  });
});

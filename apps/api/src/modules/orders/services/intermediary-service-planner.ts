import { Inject, Injectable } from '@nestjs/common';
import type { GeoPoint, ServiceType } from '@colheita/contracts';
import { BusinessRuleViolationError } from '../../../shared/errors/domain-error';
import { calculateDistanceKm } from '../../../shared/geo/geo-distance';
import {
  SERVICE_PROVIDER_REPOSITORY,
  ServiceProviderRepository,
} from '../../service-providers/repositories/service-provider.repository';
import { ServiceProvider } from '../../service-providers/entities/service-provider.entity';
import { ServiceFeeCalculator } from '../../service-providers/services/service-fee-calculator';
import { DeliveryMode, ServiceCharge } from '../entities/order.entity';

export interface ServicePlanInput {
  deliveryMode: DeliveryMode;
  extraServices: Array<Extract<ServiceType, 'COLD_STORAGE' | 'PACKING'>>;
  pickupLocation: GeoPoint;
  deliveryLocation: GeoPoint;
  boxes: number;
}

/** Escolhe os prestadores mais próximos para cada serviço do pedido e calcula o valor de cada um. */
@Injectable()
export class IntermediaryServicePlanner {
  constructor(
    @Inject(SERVICE_PROVIDER_REPOSITORY) private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly serviceFeeCalculator: ServiceFeeCalculator,
  ) {}

  async planServices(input: ServicePlanInput): Promise<ServiceCharge[]> {
    const needsRefrigeration = input.extraServices.includes('COLD_STORAGE');
    const feeInput = {
      distanceKm: calculateDistanceKm(input.pickupLocation, input.deliveryLocation),
      boxes: input.boxes,
      needsRefrigeration,
    };
    const charges: ServiceCharge[] = [];

    // Preço divulgado pelo prestador escolhido; a tabela de referência só cobre quem ainda não divulgou
    if (input.deliveryMode === 'PLATFORM_FREIGHT') {
      charges.push(
        await this.buildCharge('TRANSPORT', input.pickupLocation, (provider) =>
          provider.estimatePrice('TRANSPORT', feeInput.distanceKm) ?? this.serviceFeeCalculator.calculateFreightFee(feeInput),
        ),
      );
    }
    if (input.extraServices.includes('COLD_STORAGE')) {
      charges.push(
        await this.buildCharge('COLD_STORAGE', input.pickupLocation, (provider) =>
          provider.estimatePrice('COLD_STORAGE', feeInput.boxes) ?? this.serviceFeeCalculator.calculateColdStorageFee(feeInput),
        ),
      );
    }
    if (input.extraServices.includes('PACKING')) {
      charges.push(
        await this.buildCharge('PACKING', input.pickupLocation, (provider) =>
          provider.estimatePrice('PACKING', feeInput.boxes) ?? this.serviceFeeCalculator.calculatePackingFee(feeInput),
        ),
      );
    }
    return charges;
  }

  private async buildCharge(
    serviceType: ServiceType,
    location: GeoPoint,
    priceFor: (provider: ServiceProvider) => number,
  ): Promise<ServiceCharge> {
    const [nearestProvider] = await this.serviceProviderRepository.findApprovedServingLocation(serviceType, location);
    if (!nearestProvider) {
      throw new BusinessRuleViolationError(`Ainda não há prestador de ${serviceType} atendendo esta região`);
    }
    return {
      serviceType,
      serviceProviderId: nearestProvider.id,
      serviceProviderWalletId: nearestProvider.paymentWalletId,
      amount: priceFor(nearestProvider),
    };
  }
}

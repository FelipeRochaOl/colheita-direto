import { Module } from '@nestjs/common';
import { AppConfigService } from '../../shared/config/app-config.service';
import { AsaasPaymentGateway } from './gateways/asaas-payment-gateway';
import { PAYMENT_GATEWAY } from './gateways/payment-gateway';
import { SimulatedPaymentGateway } from './gateways/simulated-payment-gateway';

@Module({
  providers: [
    {
      provide: PAYMENT_GATEWAY,
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) =>
        appConfig.get('ASAAS_API_KEY') ? new AsaasPaymentGateway(appConfig) : new SimulatedPaymentGateway(),
    },
  ],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentsModule {}

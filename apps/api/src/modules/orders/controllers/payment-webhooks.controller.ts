import { Body, Controller, ForbiddenException, Headers, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { timingSafeEqual } from 'node:crypto';
import { PublicRoute } from '../../../shared/auth/auth.decorators';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { PAYMENT_GATEWAY, PaymentGateway } from '../../payments/gateways/payment-gateway';
import { HandlePaymentConfirmedUseCase } from '../use-cases/handle-payment-confirmed.use-case';

const PAID_EVENTS = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'];

interface AsaasWebhookBody {
  event: string;
  payment?: { externalReference?: string };
}

@ApiExcludeController()
@PublicRoute()
@Controller('webhooks')
export class PaymentWebhooksController {
  constructor(
    private readonly handlePaymentConfirmedUseCase: HandlePaymentConfirmedUseCase,
    private readonly appConfig: AppConfigService,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
  ) {}

  @Post('asaas')
  @HttpCode(200)
  async receiveAsaasEvent(
    @Headers('asaas-access-token') receivedToken: string | undefined,
    @Body() body: AsaasWebhookBody,
  ): Promise<{ received: true }> {
    this.assertValidAsaasToken(receivedToken);
    const orderId = body.payment?.externalReference;
    if (PAID_EVENTS.includes(body.event) && orderId) {
      await this.handlePaymentConfirmedUseCase.execute(orderId);
    }
    return { received: true };
  }

  /** Só existe com o gateway simulado: permite testar o fluxo completo sem Asaas. */
  @Post('simulated-payments/:orderId')
  @HttpCode(204)
  async confirmSimulatedPayment(@Param('orderId') orderId: string): Promise<void> {
    if (!this.paymentGateway.isSimulated || this.appConfig.get('NODE_ENV') === 'production') {
      throw new ForbiddenException();
    }
    await this.handlePaymentConfirmedUseCase.execute(orderId);
  }

  private assertValidAsaasToken(receivedToken: string | undefined): void {
    const expectedToken = this.appConfig.get('ASAAS_WEBHOOK_TOKEN');
    if (!expectedToken || !receivedToken) throw new ForbiddenException();
    const expected = Buffer.from(expectedToken);
    const received = Buffer.from(receivedToken);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      throw new ForbiddenException();
    }
  }
}

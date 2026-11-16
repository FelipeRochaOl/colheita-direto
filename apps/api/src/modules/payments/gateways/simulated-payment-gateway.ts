import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PaymentCustomer, PaymentGateway, PixCharge, PixChargeRequest } from './payment-gateway';

/** Usado em desenvolvimento quando não há chave do Asaas. A confirmação é feita pela rota de simulação. */
@Injectable()
export class SimulatedPaymentGateway implements PaymentGateway {
  readonly isSimulated = true;
  private readonly logger = new Logger(SimulatedPaymentGateway.name);

  async ensureCustomer(customer: PaymentCustomer): Promise<string> {
    return `simulated-customer-${customer.document}`;
  }

  async createPixCharge(request: PixChargeRequest): Promise<PixCharge> {
    const chargeId = `simulated-charge-${randomUUID()}`;
    this.logger.log(
      `Cobrança simulada ${chargeId}: R$ ${request.amount.toFixed(2)} (pedido ${request.externalReference}); split: ${JSON.stringify(request.splits)}`,
    );
    return {
      chargeId,
      pixQrCodeImage: null,
      pixCopyPaste: `00020126SIMULADO${request.externalReference}`,
      invoiceUrl: null,
    };
  }

  async refundCharge(chargeId: string): Promise<void> {
    this.logger.log(`Estorno simulado ${chargeId}`);
  }
}

import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { PaymentCustomer, PaymentGateway, PixCharge, PixChargeRequest } from './payment-gateway';

const PIX_DUE_IN_DAYS = 1;

/** Integração Asaas (API v3): clientes, cobrança Pix com split entre carteiras e estorno. */
@Injectable()
export class AsaasPaymentGateway implements PaymentGateway {
  readonly isSimulated = false;

  constructor(private readonly appConfig: AppConfigService) {}

  async ensureCustomer(customer: PaymentCustomer): Promise<string> {
    const created = await this.request<{ id: string }>('POST', '/customers', {
      name: customer.name,
      cpfCnpj: customer.document,
      mobilePhone: customer.phoneNumber.replace('+55', ''),
    });
    return created.id;
  }

  async createPixCharge(request: PixChargeRequest): Promise<PixCharge> {
    const dueDate = new Date(Date.now() + PIX_DUE_IN_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const payment = await this.request<{ id: string; invoiceUrl: string }>('POST', '/payments', {
      customer: request.customerId,
      billingType: 'PIX',
      value: request.amount,
      dueDate,
      description: request.description,
      externalReference: request.externalReference,
      split: request.splits.map((split) => ({ walletId: split.walletId, fixedValue: split.amount })),
    });
    const pixQrCode = await this.request<{ encodedImage: string; payload: string }>(
      'GET',
      `/payments/${payment.id}/pixQrCode`,
    );
    return {
      chargeId: payment.id,
      pixQrCodeImage: `data:image/png;base64,${pixQrCode.encodedImage}`,
      pixCopyPaste: pixQrCode.payload,
      invoiceUrl: payment.invoiceUrl,
    };
  }

  async refundCharge(chargeId: string): Promise<void> {
    await this.request('POST', `/payments/${chargeId}/refund`, {});
  }

  private async request<ResponseBody>(method: string, path: string, body?: object): Promise<ResponseBody> {
    const response = await fetch(`${this.appConfig.get('ASAAS_API_URL')}${path}`, {
      method,
      headers: {
        access_token: this.appConfig.get('ASAAS_API_KEY') ?? '',
        'Content-Type': 'application/json',
        'User-Agent': 'colheita-direta-api',
      },
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Asaas respondeu ${response.status} em ${path}: ${await response.text()}`);
    }
    return (await response.json()) as ResponseBody;
  }
}

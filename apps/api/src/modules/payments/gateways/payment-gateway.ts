export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentCustomer {
  name: string;
  document: string;
  phoneNumber: string;
}

export interface PaymentSplit {
  walletId: string;
  amount: number;
}

export interface PixChargeRequest {
  customerId: string;
  amount: number;
  description: string;
  externalReference: string;
  splits: PaymentSplit[];
}

export interface PixCharge {
  chargeId: string;
  pixQrCodeImage: string | null;
  pixCopyPaste: string | null;
  invoiceUrl: string | null;
}

/** Porta de pagamentos. Use-cases nunca importam nada do Asaas diretamente. */
export interface PaymentGateway {
  readonly isSimulated: boolean;
  ensureCustomer(customer: PaymentCustomer): Promise<string>;
  createPixCharge(request: PixChargeRequest): Promise<PixCharge>;
  refundCharge(chargeId: string): Promise<void>;
}

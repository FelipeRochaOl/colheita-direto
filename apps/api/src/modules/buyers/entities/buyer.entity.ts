import type { BuyerType, GeoPoint } from '@colheita/contracts';

export interface BuyerProps {
  id: string;
  name: string;
  buyerType: BuyerType;
  document: string;
  phoneNumber: string;
  deliveryLocation: GeoPoint;
  deliveryAddress: string;
  paymentCustomerId: string | null;
  createdAt: Date;
}

/** Comprador: varejo, restaurante, indústria, compras públicas ou consumidor final. */
export class Buyer {
  private constructor(private readonly props: BuyerProps) {}

  static register(props: Omit<BuyerProps, 'paymentCustomerId' | 'createdAt'>): Buyer {
    return new Buyer({ ...props, paymentCustomerId: null, createdAt: new Date() });
  }

  static restore(props: BuyerProps): Buyer {
    return new Buyer(props);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get document() {
    return this.props.document;
  }
  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get deliveryLocation() {
    return this.props.deliveryLocation;
  }
  get paymentCustomerId() {
    return this.props.paymentCustomerId;
  }

  linkPaymentCustomer(customerId: string): void {
    this.props.paymentCustomerId = customerId;
  }

  toSnapshot(): BuyerProps {
    return { ...this.props };
  }
}

import type { GeoPoint, ServiceType } from '@colheita/contracts';

export interface ServiceProviderProps {
  id: string;
  name: string;
  document: string;
  phoneNumber: string;
  serviceTypes: ServiceType[];
  baseLocation: GeoPoint;
  serviceRadiusKm: number;
  vehicleCapacityKg: number | null;
  hasRefrigeration: boolean;
  isApproved: boolean;
  paymentWalletId: string | null;
  createdAt: Date;
}

/** Prestador de serviço intermediário: transporte, câmara fria, embalagem, classificação, assistência técnica. */
export class ServiceProvider {
  private constructor(private readonly props: ServiceProviderProps) {}

  static register(props: Omit<ServiceProviderProps, 'isApproved' | 'paymentWalletId' | 'createdAt'>): ServiceProvider {
    return new ServiceProvider({ ...props, isApproved: false, paymentWalletId: null, createdAt: new Date() });
  }

  static restore(props: ServiceProviderProps): ServiceProvider {
    return new ServiceProvider(props);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get paymentWalletId() {
    return this.props.paymentWalletId;
  }
  get hasRefrigeration() {
    return this.props.hasRefrigeration;
  }

  offers(serviceType: ServiceType): boolean {
    return this.props.serviceTypes.includes(serviceType);
  }

  canReceiveOrders(): boolean {
    return this.props.isApproved;
  }

  /** Documentos conferidos pela operação: só então o prestador recebe pedidos. */
  approve(): void {
    this.props.isApproved = true;
  }

  toSnapshot(): ServiceProviderProps {
    return { ...this.props, serviceTypes: [...this.props.serviceTypes] };
  }
}

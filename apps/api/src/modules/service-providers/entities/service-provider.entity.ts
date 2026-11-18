import type { GeoPoint, ServiceType } from '@colheita/contracts';

/** Serviço divulgado: preço por unidade do tipo (km, caixa/dia, caixa, visita) e taxa de saída (frete). */
export interface ServiceOfferingProps {
  serviceType: ServiceType;
  price: number;
  baseFee: number;
  description: string | null;
}

export interface ServiceProviderProps {
  id: string;
  name: string;
  document: string;
  phoneNumber: string;
  serviceTypes: ServiceType[];
  offerings: ServiceOfferingProps[];
  baseLocation: GeoPoint;
  serviceRadiusKm: number;
  vehicleCapacityKg: number | null;
  hasRefrigeration: boolean;
  isApproved: boolean;
  paymentWalletId: string | null;
  createdAt: Date;
}

export type ServiceProviderProfileUpdate = Pick<
  ServiceProviderProps,
  'name' | 'offerings' | 'baseLocation' | 'serviceRadiusKm' | 'vehicleCapacityKg' | 'hasRefrigeration'
>;

const roundToCents = (value: number) => Math.round(value * 100) / 100;

/** Prestador de serviço intermediário: transporte, câmara fria, embalagem, classificação, assistência técnica. */
export class ServiceProvider {
  private constructor(private readonly props: ServiceProviderProps) {}

  static register(
    props: Omit<ServiceProviderProps, 'isApproved' | 'paymentWalletId' | 'createdAt' | 'offerings'> & {
      offerings?: ServiceOfferingProps[];
    },
  ): ServiceProvider {
    return new ServiceProvider({
      ...props,
      offerings: props.offerings ?? [],
      isApproved: false,
      paymentWalletId: null,
      createdAt: new Date(),
    });
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
  get baseLocation() {
    return this.props.baseLocation;
  }
  get serviceRadiusKm() {
    return this.props.serviceRadiusKm;
  }

  offers(serviceType: ServiceType): boolean {
    return this.props.serviceTypes.includes(serviceType);
  }

  offeringFor(serviceType: ServiceType): ServiceOfferingProps | null {
    return this.props.offerings.find((offering) => offering.serviceType === serviceType) ?? null;
  }

  /** Taxa de saída + preço × quantidade (na unidade do serviço). Null quando o prestador não divulgou preço. */
  estimatePrice(serviceType: ServiceType, quantity: number): number | null {
    const offering = this.offeringFor(serviceType);
    if (!offering) return null;
    return roundToCents(offering.baseFee + offering.price * quantity);
  }

  canReceiveOrders(): boolean {
    return this.props.isApproved;
  }

  /** Documentos conferidos pela operação: só então o prestador recebe pedidos. */
  approve(): void {
    this.props.isApproved = true;
  }

  /** "Meus serviços": os tipos atendidos passam a ser exatamente os serviços com preço divulgado. */
  updateProfile(update: ServiceProviderProfileUpdate): void {
    Object.assign(this.props, update, {
      offerings: update.offerings.map((offering) => ({ ...offering })),
      serviceTypes: update.offerings.map((offering) => offering.serviceType),
    });
  }

  toSnapshot(): ServiceProviderProps {
    return {
      ...this.props,
      serviceTypes: [...this.props.serviceTypes],
      offerings: this.props.offerings.map((offering) => ({ ...offering })),
    };
  }
}

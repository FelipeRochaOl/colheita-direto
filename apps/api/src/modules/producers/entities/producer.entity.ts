import type { GeoPoint } from '@colheita/contracts';

export interface ProducerProps {
  id: string;
  name: string;
  farmName: string;
  farmLocation: GeoPoint;
  city: string;
  state: string;
  crops: string[];
  familyFarmRegistration: string | null;
  paymentWalletId: string | null;
  createdAt: Date;
}

/** Produtor rural. O id é o mesmo do usuário dono do perfil. */
export class Producer {
  private constructor(private readonly props: ProducerProps) {}

  static register(props: Omit<ProducerProps, 'paymentWalletId' | 'createdAt'>): Producer {
    return new Producer({ ...props, paymentWalletId: null, createdAt: new Date() });
  }

  static restore(props: ProducerProps): Producer {
    return new Producer(props);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get farmLocation() {
    return this.props.farmLocation;
  }
  get city() {
    return this.props.city;
  }
  get state() {
    return this.props.state;
  }
  get paymentWalletId() {
    return this.props.paymentWalletId;
  }

  /** Apto a vender para compras públicas (PNAE/PAA) quando tem CAF informado. */
  isEligibleForPublicProcurement(): boolean {
    return Boolean(this.props.familyFarmRegistration);
  }

  /** Dados que o próprio produtor pode corrigir em "Meus dados". */
  updateProfile(changes: Pick<ProducerProps, 'name' | 'farmName' | 'farmLocation' | 'city' | 'state' | 'crops' | 'familyFarmRegistration'>): void {
    Object.assign(this.props, { ...changes, state: changes.state.toUpperCase(), crops: [...changes.crops] });
  }

  linkPaymentWallet(walletId: string): void {
    this.props.paymentWalletId = walletId;
  }

  toSnapshot(): ProducerProps {
    return { ...this.props, crops: [...this.props.crops] };
  }
}

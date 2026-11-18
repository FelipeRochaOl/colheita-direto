import type { GeoPoint } from '@colheita/contracts';

export interface NgoProps {
  id: string;
  name: string;
  document: string;
  phoneNumber: string;
  location: GeoPoint;
  address: string;
  pickupRadiusKm: number;
  isApproved: boolean;
  createdAt: Date;
}

/** ONG ou banco de alimentos que recebe doações. */
export class Ngo {
  private constructor(private readonly props: NgoProps) {}

  static register(props: Omit<NgoProps, 'isApproved' | 'createdAt'>): Ngo {
    return new Ngo({ ...props, isApproved: false, createdAt: new Date() });
  }

  static restore(props: NgoProps): Ngo {
    return new Ngo(props);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get location() {
    return this.props.location;
  }
  get pickupRadiusKm() {
    return this.props.pickupRadiusKm;
  }
  get isApproved() {
    return this.props.isApproved;
  }

  /** CNPJ fica de fora: foi conferido na aprovação da organização. */
  updateProfile(changes: Pick<NgoProps, 'name' | 'location' | 'address' | 'pickupRadiusKm'>): void {
    Object.assign(this.props, changes);
  }

  approve(): void {
    this.props.isApproved = true;
  }

  toSnapshot(): NgoProps {
    return { ...this.props };
  }
}

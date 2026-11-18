import type { UserRole } from '@colheita/contracts';
import { generateEntityId } from '../../../shared/database/entity-id';
import { NotificationRecipient } from '../../notifications/notification-message';

export interface PrivacyConsent {
  policyVersion: string;
  acceptedAt: Date;
}

export interface UserProps {
  id: string;
  phoneNumber: string;
  name: string | null;
  roles: UserRole[];
  privacyConsent: PrivacyConsent | null;
  lastWhatsAppInboundAt: Date | null;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static createFromPhone(phoneNumber: string): User {
    return new User({
      id: generateEntityId(),
      phoneNumber,
      name: null,
      roles: [],
      privacyConsent: null,
      lastWhatsAppInboundAt: null,
      createdAt: new Date(),
    });
  }

  static restore(props: UserProps): User {
    return new User(props);
  }

  get id() {
    return this.props.id;
  }
  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get name() {
    return this.props.name;
  }
  get roles() {
    return [...this.props.roles];
  }

  hasRole(role: UserRole): boolean {
    return this.props.roles.includes(role);
  }

  /** Concede um papel (produtor, comprador...) após o cadastro do perfil, registrando o consentimento LGPD. */
  grantRole(role: UserRole, name: string, privacyPolicyVersion: string): void {
    if (!this.hasRole(role)) this.props.roles.push(role);
    this.props.name = name;
    this.props.privacyConsent = { policyVersion: privacyPolicyVersion, acceptedAt: new Date() };
  }

  /** Nome exibido na conta, atualizado quando o usuário edita "Meus dados". */
  rename(name: string): void {
    this.props.name = name;
  }

  recordWhatsAppInbound(receivedAt: Date): void {
    this.props.lastWhatsAppInboundAt = receivedAt;
  }

  toNotificationRecipient(): NotificationRecipient {
    return { phoneNumber: this.props.phoneNumber, lastWhatsAppInboundAt: this.props.lastWhatsAppInboundAt };
  }

  toSnapshot(): UserProps {
    return { ...this.props, roles: [...this.props.roles] };
  }
}

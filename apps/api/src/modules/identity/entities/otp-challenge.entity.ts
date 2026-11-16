import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

const OTP_LIFETIME_MILLISECONDS = 10 * 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;

export interface OtpChallengeProps {
  phoneNumber: string;
  codeHash: string;
  expiresAt: Date;
  failedAttempts: number;
}

/** Desafio de login por código de 6 dígitos. O código nunca é armazenado em texto puro. */
export class OtpChallenge {
  private constructor(private readonly props: OtpChallengeProps) {}

  static issue(phoneNumber: string): { challenge: OtpChallenge; plainCode: string } {
    const plainCode = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const challenge = new OtpChallenge({
      phoneNumber,
      codeHash: OtpChallenge.hashCode(phoneNumber, plainCode),
      expiresAt: new Date(Date.now() + OTP_LIFETIME_MILLISECONDS),
      failedAttempts: 0,
    });
    return { challenge, plainCode };
  }

  static restore(props: OtpChallengeProps): OtpChallenge {
    return new OtpChallenge(props);
  }

  get phoneNumber() {
    return this.props.phoneNumber;
  }

  isUsable(now: Date): boolean {
    return now < this.props.expiresAt && this.props.failedAttempts < MAX_VERIFICATION_ATTEMPTS;
  }

  matches(plainCode: string): boolean {
    const expected = Buffer.from(this.props.codeHash, 'hex');
    const received = Buffer.from(OtpChallenge.hashCode(this.props.phoneNumber, plainCode), 'hex');
    return timingSafeEqual(expected, received);
  }

  registerFailedAttempt(): void {
    this.props.failedAttempts += 1;
  }

  toSnapshot(): OtpChallengeProps {
    return { ...this.props };
  }

  private static hashCode(phoneNumber: string, plainCode: string): string {
    return createHash('sha256').update(`${phoneNumber}:${plainCode}`).digest('hex');
  }
}

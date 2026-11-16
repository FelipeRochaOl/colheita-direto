import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, VerifyOtpInput } from '@colheita/contracts';
import { InvalidCredentialsError } from '../../../shared/errors/domain-error';
import { User } from '../entities/user.entity';
import { OTP_CHALLENGE_REPOSITORY, OtpChallengeRepository } from '../repositories/otp-challenge.repository';
import { USER_REPOSITORY, UserRepository } from '../repositories/user.repository';
import { SessionTokenService } from '../services/session-token.service';

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(OTP_CHALLENGE_REPOSITORY) private readonly otpChallengeRepository: OtpChallengeRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(input: VerifyOtpInput): Promise<AuthSession> {
    const challenge = await this.otpChallengeRepository.findByPhoneNumber(input.phoneNumber);
    if (!challenge || !challenge.isUsable(new Date())) {
      throw new InvalidCredentialsError('Código expirado. Peça um novo código.');
    }
    if (!challenge.matches(input.code)) {
      challenge.registerFailedAttempt();
      await this.otpChallengeRepository.save(challenge);
      throw new InvalidCredentialsError('Código incorreto');
    }
    await this.otpChallengeRepository.deleteByPhoneNumber(input.phoneNumber);

    const user = (await this.userRepository.findByPhoneNumber(input.phoneNumber)) ?? User.createFromPhone(input.phoneNumber);
    await this.userRepository.save(user);
    return this.sessionTokenService.createSession(user);
  }
}

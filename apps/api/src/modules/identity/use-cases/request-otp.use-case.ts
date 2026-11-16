import { Inject, Injectable } from '@nestjs/common';
import type { RequestOtpInput } from '@colheita/contracts';
import { NotificationService } from '../../notifications/services/notification.service';
import { OtpChallenge } from '../entities/otp-challenge.entity';
import { OTP_CHALLENGE_REPOSITORY, OtpChallengeRepository } from '../repositories/otp-challenge.repository';
import { USER_REPOSITORY, UserRepository } from '../repositories/user.repository';

@Injectable()
export class RequestOtpUseCase {
  constructor(
    @Inject(OTP_CHALLENGE_REPOSITORY) private readonly otpChallengeRepository: OtpChallengeRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(input: RequestOtpInput): Promise<void> {
    const { challenge, plainCode } = OtpChallenge.issue(input.phoneNumber);
    await this.otpChallengeRepository.save(challenge);

    const existingUser = await this.userRepository.findByPhoneNumber(input.phoneNumber);
    await this.notificationService.notify(
      { phoneNumber: input.phoneNumber, lastWhatsAppInboundAt: existingUser?.toNotificationRecipient().lastWhatsAppInboundAt ?? null },
      {
        text: `Colheita Direta: seu código de acesso é ${plainCode}. Ele vale por 10 minutos.`,
        template: { name: 'codigo_de_acesso', languageCode: 'pt_BR', bodyParameters: [plainCode] },
      },
    );
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession } from '@colheita/contracts';
import { InvalidCredentialsError } from '../../../shared/errors/domain-error';
import { USER_REPOSITORY, UserRepository } from '../repositories/user.repository';
import { SessionTokenService } from '../services/session-token.service';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(refreshToken: string): Promise<AuthSession> {
    const userId = await this.sessionTokenService.readRefreshToken(refreshToken).catch(() => null);
    const user = userId ? await this.userRepository.findById(userId) : null;
    if (!user) throw new InvalidCredentialsError('Sessão expirada. Entre novamente.');
    return this.sessionTokenService.createSession(user);
  }
}

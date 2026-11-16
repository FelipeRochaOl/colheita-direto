import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession, UserRole } from '@colheita/contracts';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { USER_REPOSITORY, UserRepository } from '../repositories/user.repository';
import { SessionTokenService } from '../services/session-token.service';

/** Usado pelos cadastros de perfil: concede o papel e devolve uma sessão nova com o papel no token. */
@Injectable()
export class GrantUserRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly sessionTokenService: SessionTokenService,
    private readonly appConfig: AppConfigService,
  ) {}

  async execute(userId: string, role: UserRole, displayName: string): Promise<AuthSession> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundError('Usuário', userId);
    user.grantRole(role, displayName, this.appConfig.get('PRIVACY_POLICY_VERSION'));
    await this.userRepository.save(user);
    return this.sessionTokenService.createSession(user);
  }
}

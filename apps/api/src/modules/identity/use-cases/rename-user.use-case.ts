import { Inject, Injectable } from '@nestjs/common';
import type { AuthSession } from '@colheita/contracts';
import { EntityNotFoundError } from '../../../shared/errors/domain-error';
import { USER_REPOSITORY, UserRepository } from '../repositories/user.repository';
import { SessionTokenService } from '../services/session-token.service';

/** Usado pela edição de perfil: troca o nome da conta e devolve sessão nova (o cabeçalho mostra o nome novo). */
@Injectable()
export class RenameUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(userId: string, name: string): Promise<AuthSession> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundError('Usuário', userId);
    user.rename(name);
    await this.userRepository.save(user);
    return this.sessionTokenService.createSession(user);
  }
}

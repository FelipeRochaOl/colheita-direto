import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthSession } from '@colheita/contracts';
import { User } from '../entities/user.entity';

const ACCESS_TOKEN_LIFETIME = '15m';
const REFRESH_TOKEN_LIFETIME = '30d';

@Injectable()
export class SessionTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createSession(user: User): Promise<AuthSession> {
    const claims = { userId: user.id, phoneNumber: user.phoneNumber, roles: user.roles };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ ...claims, tokenType: 'access' }, { expiresIn: ACCESS_TOKEN_LIFETIME }),
      this.jwtService.signAsync({ userId: user.id, tokenType: 'refresh' }, { expiresIn: REFRESH_TOKEN_LIFETIME }),
    ]);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, phoneNumber: user.phoneNumber, name: user.name, roles: user.roles },
    };
  }

  async readRefreshToken(refreshToken: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync<{ userId: string; tokenType: string }>(refreshToken);
    if (payload.tokenType !== 'refresh') throw new Error('Token não é de renovação');
    return payload.userId;
  }
}

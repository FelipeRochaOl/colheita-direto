import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../../shared/config/app-config.service';
import { AuthController } from './controllers/auth.controller';
import { MongoOtpChallengeRepository } from './repositories/mongo-otp-challenge.repository';
import { MongoUserRepository } from './repositories/mongo-user.repository';
import { OTP_CHALLENGE_REPOSITORY } from './repositories/otp-challenge.repository';
import { USER_REPOSITORY } from './repositories/user.repository';
import { OtpChallengeDocument, OtpChallengeSchema } from './schemas/otp-challenge.schema';
import { UserDocument, UserSchema } from './schemas/user.schema';
import { SessionTokenService } from './services/session-token.service';
import { GrantUserRoleUseCase } from './use-cases/grant-user-role.use-case';
import { RefreshSessionUseCase } from './use-cases/refresh-session.use-case';
import { RequestOtpUseCase } from './use-cases/request-otp.use-case';
import { VerifyOtpUseCase } from './use-cases/verify-otp.use-case';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: OtpChallengeDocument.name, schema: OtpChallengeSchema },
    ]),
    JwtModule.registerAsync({
      global: true,
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) => ({ secret: appConfig.get('JWT_SECRET') }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: MongoUserRepository },
    { provide: OTP_CHALLENGE_REPOSITORY, useClass: MongoOtpChallengeRepository },
    SessionTokenService,
    RequestOtpUseCase,
    VerifyOtpUseCase,
    RefreshSessionUseCase,
    GrantUserRoleUseCase,
  ],
  exports: [USER_REPOSITORY, GrantUserRoleUseCase],
})
export class IdentityModule {}

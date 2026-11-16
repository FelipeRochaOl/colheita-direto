import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { requestOtpSchema, verifyOtpSchema } from '@colheita/contracts';
import type { AuthSession, RequestOtpInput, VerifyOtpInput } from '@colheita/contracts';
import { PublicRoute } from '../../../shared/auth/auth.decorators';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { RefreshSessionUseCase } from '../use-cases/refresh-session.use-case';
import { RequestOtpUseCase } from '../use-cases/request-otp.use-case';
import { VerifyOtpUseCase } from '../use-cases/verify-otp.use-case';

@ApiTags('Autenticação')
@PublicRoute()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestOtpUseCase: RequestOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
  ) {}

  @Post('otp/request')
  @HttpCode(204)
  @ApiBodyFromSchema(requestOtpSchema)
  async requestOtp(@ValidatedBody(requestOtpSchema) input: RequestOtpInput): Promise<void> {
    await this.requestOtpUseCase.execute(input);
  }

  @Post('otp/verify')
  @ApiBodyFromSchema(verifyOtpSchema)
  verifyOtp(@ValidatedBody(verifyOtpSchema) input: VerifyOtpInput): Promise<AuthSession> {
    return this.verifyOtpUseCase.execute(input);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string): Promise<AuthSession> {
    return this.refreshSessionUseCase.execute(refreshToken);
  }
}

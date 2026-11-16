import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registerServiceProviderSchema } from '@colheita/contracts';
import type { AuthSession, RegisterServiceProviderInput } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { ApproveServiceProviderUseCase } from '../use-cases/approve-service-provider.use-case';
import { RegisterServiceProviderUseCase } from '../use-cases/register-service-provider.use-case';

@ApiTags('Prestadores de serviço')
@ApiBearerAuth()
@Controller('service-providers')
export class ServiceProvidersController {
  constructor(
    private readonly registerServiceProviderUseCase: RegisterServiceProviderUseCase,
    private readonly approveServiceProviderUseCase: ApproveServiceProviderUseCase,
  ) {}

  @Post()
  @ApiBodyFromSchema(registerServiceProviderSchema)
  register(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(registerServiceProviderSchema) input: RegisterServiceProviderInput,
  ): Promise<AuthSession> {
    return this.registerServiceProviderUseCase.execute(user, input);
  }

  @Post(':serviceProviderId/approval')
  @HttpCode(204)
  @Roles('admin')
  approve(@Param('serviceProviderId') serviceProviderId: string): Promise<void> {
    return this.approveServiceProviderUseCase.execute(serviceProviderId);
  }
}

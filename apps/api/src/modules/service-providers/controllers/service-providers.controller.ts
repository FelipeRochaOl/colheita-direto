import { Controller, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  registerServiceProviderSchema,
  searchServiceProvidersSchema,
  updateServiceProviderProfileSchema,
} from '@colheita/contracts';
import type {
  AuthSession,
  AvailableServiceProvider,
  RegisterServiceProviderInput,
  ServiceProviderProfile,
  UpdateServiceProviderProfileInput,
} from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe';
import { ApproveServiceProviderUseCase } from '../use-cases/approve-service-provider.use-case';
import { GetServiceProviderProfileUseCase } from '../use-cases/get-service-provider-profile.use-case';
import { RegisterServiceProviderUseCase } from '../use-cases/register-service-provider.use-case';
import { SearchServiceProvidersUseCase } from '../use-cases/search-service-providers.use-case';
import { UpdateServiceProviderProfileUseCase } from '../use-cases/update-service-provider-profile.use-case';

@ApiTags('Prestadores de serviço')
@ApiBearerAuth()
@Controller('service-providers')
export class ServiceProvidersController {
  constructor(
    private readonly registerServiceProviderUseCase: RegisterServiceProviderUseCase,
    private readonly approveServiceProviderUseCase: ApproveServiceProviderUseCase,
    private readonly getServiceProviderProfileUseCase: GetServiceProviderProfileUseCase,
    private readonly updateServiceProviderProfileUseCase: UpdateServiceProviderProfileUseCase,
    private readonly searchServiceProvidersUseCase: SearchServiceProvidersUseCase,
  ) {}

  @Post()
  @ApiBodyFromSchema(registerServiceProviderSchema)
  register(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(registerServiceProviderSchema) input: RegisterServiceProviderInput,
  ): Promise<AuthSession> {
    return this.registerServiceProviderUseCase.execute(user, input);
  }

  @Get('me')
  @Roles('service_provider')
  getMyProfile(@CurrentUser() user: AuthenticatedUser): Promise<ServiceProviderProfile> {
    return this.getServiceProviderProfileUseCase.execute(user.userId);
  }

  @Put('me')
  @Roles('service_provider')
  @ApiBodyFromSchema(updateServiceProviderProfileSchema)
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(updateServiceProviderProfileSchema) input: UpdateServiceProviderProfileInput,
  ): Promise<AuthSession> {
    return this.updateServiceProviderProfileUseCase.execute(user.userId, input);
  }

  /** Busca do produtor: quem atende a fazenda dele, com preço estimado para a quantidade informada. */
  @Get('available')
  @Roles('producer')
  searchAvailable(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: { serviceType?: string; quantity?: string },
  ): Promise<AvailableServiceProvider[]> {
    const input = new ZodValidationPipe(searchServiceProvidersSchema).transform({
      serviceType: query.serviceType,
      quantity: query.quantity ? Number(query.quantity) : undefined,
    });
    return this.searchServiceProvidersUseCase.execute(user.userId, input);
  }

  @Post(':serviceProviderId/approval')
  @HttpCode(204)
  @Roles('admin')
  approve(@Param('serviceProviderId') serviceProviderId: string): Promise<void> {
    return this.approveServiceProviderUseCase.execute(serviceProviderId);
  }
}

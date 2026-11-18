import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createServiceRequestSchema } from '@colheita/contracts';
import type { CreateServiceRequestInput, ServiceRequest, ServiceRequestBoard } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { CreateServiceRequestUseCase } from '../use-cases/create-service-request.use-case';
import { ListServiceRequestsUseCase } from '../use-cases/list-service-requests.use-case';
import { RespondServiceRequestUseCase } from '../use-cases/respond-service-request.use-case';

@ApiTags('Contratação de serviços')
@ApiBearerAuth()
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly createServiceRequestUseCase: CreateServiceRequestUseCase,
    private readonly listServiceRequestsUseCase: ListServiceRequestsUseCase,
    private readonly respondServiceRequestUseCase: RespondServiceRequestUseCase,
  ) {}

  @Post()
  @Roles('producer')
  @ApiBodyFromSchema(createServiceRequestSchema)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(createServiceRequestSchema) input: CreateServiceRequestInput,
  ): Promise<ServiceRequest> {
    return this.createServiceRequestUseCase.execute(user.userId, input);
  }

  @Get()
  @Roles('producer', 'service_provider')
  list(@CurrentUser() user: AuthenticatedUser): Promise<ServiceRequestBoard> {
    return this.listServiceRequestsUseCase.execute(user.userId);
  }

  @Post(':serviceRequestId/acceptance')
  @HttpCode(200)
  @Roles('service_provider')
  accept(@CurrentUser() user: AuthenticatedUser, @Param('serviceRequestId') serviceRequestId: string): Promise<ServiceRequest> {
    return this.respondServiceRequestUseCase.execute(user.userId, serviceRequestId, true);
  }

  @Post(':serviceRequestId/refusal')
  @HttpCode(200)
  @Roles('service_provider')
  decline(@CurrentUser() user: AuthenticatedUser, @Param('serviceRequestId') serviceRequestId: string): Promise<ServiceRequest> {
    return this.respondServiceRequestUseCase.execute(user.userId, serviceRequestId, false);
  }
}

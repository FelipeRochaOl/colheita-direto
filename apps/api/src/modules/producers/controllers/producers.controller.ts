import { Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registerProducerSchema, updateProducerProfileSchema } from '@colheita/contracts';
import type { AuthSession, RegisterProducerInput, UpdateProducerProfileInput } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { ProducerProps } from '../entities/producer.entity';
import { GetProducerProfileUseCase } from '../use-cases/get-producer-profile.use-case';
import { RegisterProducerUseCase } from '../use-cases/register-producer.use-case';
import { UpdateProducerProfileUseCase } from '../use-cases/update-producer-profile.use-case';

@ApiTags('Produtores')
@ApiBearerAuth()
@Controller('producers')
export class ProducersController {
  constructor(
    private readonly registerProducerUseCase: RegisterProducerUseCase,
    private readonly getProducerProfileUseCase: GetProducerProfileUseCase,
    private readonly updateProducerProfileUseCase: UpdateProducerProfileUseCase,
  ) {}

  @Post()
  @ApiBodyFromSchema(registerProducerSchema)
  register(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(registerProducerSchema) input: RegisterProducerInput,
  ): Promise<AuthSession> {
    return this.registerProducerUseCase.execute(user.userId, input);
  }

  @Get('me')
  @Roles('producer')
  getMyProfile(@CurrentUser() user: AuthenticatedUser): Promise<ProducerProps> {
    return this.getProducerProfileUseCase.execute(user.userId);
  }

  @Put('me')
  @Roles('producer')
  @ApiBodyFromSchema(updateProducerProfileSchema)
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(updateProducerProfileSchema) input: UpdateProducerProfileInput,
  ): Promise<AuthSession> {
    return this.updateProducerProfileUseCase.execute(user.userId, input);
  }
}

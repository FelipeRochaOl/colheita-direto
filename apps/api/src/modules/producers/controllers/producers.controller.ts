import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registerProducerSchema } from '@colheita/contracts';
import type { AuthSession, RegisterProducerInput } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { ProducerProps } from '../entities/producer.entity';
import { GetProducerProfileUseCase } from '../use-cases/get-producer-profile.use-case';
import { RegisterProducerUseCase } from '../use-cases/register-producer.use-case';

@ApiTags('Produtores')
@ApiBearerAuth()
@Controller('producers')
export class ProducersController {
  constructor(
    private readonly registerProducerUseCase: RegisterProducerUseCase,
    private readonly getProducerProfileUseCase: GetProducerProfileUseCase,
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
}

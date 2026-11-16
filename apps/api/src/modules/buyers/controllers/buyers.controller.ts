import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registerBuyerSchema } from '@colheita/contracts';
import type { AuthSession, RegisterBuyerInput } from '@colheita/contracts';
import { CurrentUser } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { RegisterBuyerUseCase } from '../use-cases/register-buyer.use-case';

@ApiTags('Compradores')
@ApiBearerAuth()
@Controller('buyers')
export class BuyersController {
  constructor(private readonly registerBuyerUseCase: RegisterBuyerUseCase) {}

  @Post()
  @ApiBodyFromSchema(registerBuyerSchema)
  register(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(registerBuyerSchema) input: RegisterBuyerInput,
  ): Promise<AuthSession> {
    return this.registerBuyerUseCase.execute(user, input);
  }
}

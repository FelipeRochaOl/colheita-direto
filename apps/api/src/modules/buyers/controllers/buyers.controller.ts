import { Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registerBuyerSchema, updateBuyerProfileSchema } from '@colheita/contracts';
import type { AuthSession, BuyerProfile, RegisterBuyerInput, UpdateBuyerProfileInput } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { GetBuyerProfileUseCase } from '../use-cases/get-buyer-profile.use-case';
import { RegisterBuyerUseCase } from '../use-cases/register-buyer.use-case';
import { UpdateBuyerProfileUseCase } from '../use-cases/update-buyer-profile.use-case';

@ApiTags('Compradores')
@ApiBearerAuth()
@Controller('buyers')
export class BuyersController {
  constructor(
    private readonly registerBuyerUseCase: RegisterBuyerUseCase,
    private readonly getBuyerProfileUseCase: GetBuyerProfileUseCase,
    private readonly updateBuyerProfileUseCase: UpdateBuyerProfileUseCase,
  ) {}

  @Post()
  @ApiBodyFromSchema(registerBuyerSchema)
  register(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(registerBuyerSchema) input: RegisterBuyerInput,
  ): Promise<AuthSession> {
    return this.registerBuyerUseCase.execute(user, input);
  }

  @Get('me')
  @Roles('buyer')
  getMyProfile(@CurrentUser() user: AuthenticatedUser): Promise<BuyerProfile> {
    return this.getBuyerProfileUseCase.execute(user.userId);
  }

  @Put('me')
  @Roles('buyer')
  @ApiBodyFromSchema(updateBuyerProfileSchema)
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(updateBuyerProfileSchema) input: UpdateBuyerProfileInput,
  ): Promise<AuthSession> {
    return this.updateBuyerProfileUseCase.execute(user.userId, input);
  }
}

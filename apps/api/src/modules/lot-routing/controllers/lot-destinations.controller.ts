import { Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { confirmLotDestinationSchema } from '@colheita/contracts';
import type { ConfirmLotDestinationInput } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { ConfirmLotDestinationUseCase, LotDestinationResult } from '../use-cases/confirm-lot-destination.use-case';

@ApiTags('Lotes de colheita')
@ApiBearerAuth()
@Roles('producer')
@Controller('harvest-lots/:harvestLotId/destination')
export class LotDestinationsController {
  constructor(private readonly confirmLotDestinationUseCase: ConfirmLotDestinationUseCase) {}

  @Post()
  @ApiBodyFromSchema(confirmLotDestinationSchema)
  confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('harvestLotId') harvestLotId: string,
    @ValidatedBody(confirmLotDestinationSchema) input: ConfirmLotDestinationInput,
  ): Promise<LotDestinationResult> {
    return this.confirmLotDestinationUseCase.execute(user.userId, harvestLotId, input);
  }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createHarvestLotSchema, HARVEST_LOT_STATUSES } from '@colheita/contracts';
import type { CreateHarvestLotInput, HarvestLot, HarvestLotStatus, PhotoUploadUrl } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { HarvestLotPresenter } from '../services/harvest-lot-presenter';
import { CreateHarvestLotUseCase } from '../use-cases/create-harvest-lot.use-case';
import { CreatePhotoUploadUrlsUseCase } from '../use-cases/create-photo-upload-urls.use-case';
import { GetHarvestLotUseCase } from '../use-cases/get-harvest-lot.use-case';
import { ListProducerHarvestLotsUseCase } from '../use-cases/list-producer-harvest-lots.use-case';

@ApiTags('Lotes de colheita')
@ApiBearerAuth()
@Roles('producer')
@Controller('harvest-lots')
export class HarvestLotsController {
  constructor(
    private readonly createPhotoUploadUrlsUseCase: CreatePhotoUploadUrlsUseCase,
    private readonly createHarvestLotUseCase: CreateHarvestLotUseCase,
    private readonly listProducerHarvestLotsUseCase: ListProducerHarvestLotsUseCase,
    private readonly getHarvestLotUseCase: GetHarvestLotUseCase,
    private readonly harvestLotPresenter: HarvestLotPresenter,
  ) {}

  @Post('photo-upload-urls')
  createPhotoUploadUrls(
    @CurrentUser() user: AuthenticatedUser,
    @Body('photoCount') photoCount: number,
    @Body('contentType') contentType: string,
  ): Promise<PhotoUploadUrl[]> {
    return this.createPhotoUploadUrlsUseCase.execute(user.userId, Number(photoCount), contentType ?? 'image/jpeg');
  }

  @Post()
  @ApiBodyFromSchema(createHarvestLotSchema)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(createHarvestLotSchema) input: CreateHarvestLotInput,
  ): Promise<HarvestLot> {
    const harvestLot = await this.createHarvestLotUseCase.execute(user.userId, input);
    return this.harvestLotPresenter.present(harvestLot);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string): Promise<HarvestLot[]> {
    const statuses = status
      ?.split(',')
      .filter((value): value is HarvestLotStatus => (HARVEST_LOT_STATUSES as readonly string[]).includes(value));
    return this.listProducerHarvestLotsUseCase.execute(user.userId, statuses);
  }

  @Get(':harvestLotId')
  get(@CurrentUser() user: AuthenticatedUser, @Param('harvestLotId') harvestLotId: string): Promise<HarvestLot> {
    return this.getHarvestLotUseCase.execute(user.userId, harvestLotId);
  }
}

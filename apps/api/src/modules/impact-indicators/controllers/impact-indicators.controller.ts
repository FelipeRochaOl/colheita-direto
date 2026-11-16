import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { ImpactIndicators } from '@colheita/contracts';
import { PublicRoute } from '../../../shared/auth/auth.decorators';
import { GetImpactIndicatorsUseCase } from '../use-cases/get-impact-indicators.use-case';

/** Indicadores agregados e anônimos: públicos por transparência (relatório de impacto). */
@ApiTags('Indicadores de impacto')
@PublicRoute()
@Controller('impact-indicators')
export class ImpactIndicatorsController {
  constructor(private readonly getImpactIndicatorsUseCase: GetImpactIndicatorsUseCase) {}

  @Get()
  get(): Promise<ImpactIndicators> {
    return this.getImpactIndicatorsUseCase.execute();
  }
}

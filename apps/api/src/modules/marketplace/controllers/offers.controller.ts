import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QUALITY_GRADES, searchOffersSchema } from '@colheita/contracts';
import type { Offer, QualityGrade } from '@colheita/contracts';
import { PublicRoute } from '../../../shared/auth/auth.decorators';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe';
import { GetOfferUseCase } from '../use-cases/get-offer.use-case';
import { SearchOffersUseCase } from '../use-cases/search-offers.use-case';

interface SearchOffersQuery {
  crop?: string;
  grades?: string;
  maxDistanceKm?: string;
  latitude?: string;
  longitude?: string;
  maxPricePerBox?: string;
}

/** Vitrine pública: qualquer pessoa vê as ofertas; comprar exige login. */
@ApiTags('Marketplace')
@PublicRoute()
@Controller('offers')
export class OffersController {
  constructor(
    private readonly searchOffersUseCase: SearchOffersUseCase,
    private readonly getOfferUseCase: GetOfferUseCase,
  ) {}

  @Get()
  search(@Query() query: SearchOffersQuery): Promise<Offer[]> {
    const toNumber = (value?: string) => (value ? Number(value) : undefined);
    const input = new ZodValidationPipe(searchOffersSchema).transform({
      crop: query.crop || undefined,
      grades: query.grades
        ?.split(',')
        .filter((grade): grade is QualityGrade => (QUALITY_GRADES as readonly string[]).includes(grade)),
      maxDistanceKm: toNumber(query.maxDistanceKm),
      latitude: toNumber(query.latitude),
      longitude: toNumber(query.longitude),
      maxPricePerBox: toNumber(query.maxPricePerBox),
    });
    return this.searchOffersUseCase.execute(input);
  }

  @Get(':offerId')
  get(@Param('offerId') offerId: string): Promise<Offer> {
    return this.getOfferUseCase.execute(offerId);
  }
}

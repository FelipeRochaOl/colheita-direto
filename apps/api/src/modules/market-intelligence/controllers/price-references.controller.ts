import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Roles } from '../../../shared/auth/auth.decorators';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe';
import { RegisterPriceReferenceUseCase } from '../use-cases/register-price-reference.use-case';

const priceReferencesSchema = z.array(
  z.object({
    crop: z.string().min(2),
    pricePerKg: z.number().positive(),
    source: z.string().min(2),
    referenceDate: z.coerce.date(),
  }),
);

@ApiTags('Inteligência de mercado')
@ApiBearerAuth()
@Controller('market-intelligence/price-references')
export class PriceReferencesController {
  constructor(private readonly registerPriceReferenceUseCase: RegisterPriceReferenceUseCase) {}

  @Post()
  @Roles('admin')
  async register(
    @Body(new ZodValidationPipe(priceReferencesSchema)) references: z.infer<typeof priceReferencesSchema>,
  ): Promise<{ registered: number }> {
    return { registered: await this.registerPriceReferenceUseCase.execute(references) };
  }
}

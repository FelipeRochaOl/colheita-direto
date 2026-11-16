import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe';
import { EXPENSE_CATEGORIES, ExpenseProps } from '../entities/expense.entity';
import { FarmSummary, GetFarmSummaryUseCase } from '../use-cases/get-farm-summary.use-case';
import { RegisterExpenseUseCase } from '../use-cases/register-expense.use-case';

const registerExpenseSchema = z.object({
  description: z.string().min(2),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive(),
  crop: z.string().optional(),
  spentAt: z.coerce.date().optional(),
});

@ApiTags('Gestão do produtor')
@ApiBearerAuth()
@Roles('producer')
@Controller('farm')
export class FarmManagementController {
  constructor(
    private readonly registerExpenseUseCase: RegisterExpenseUseCase,
    private readonly getFarmSummaryUseCase: GetFarmSummaryUseCase,
  ) {}

  @Post('expenses')
  registerExpense(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(registerExpenseSchema)) input: z.infer<typeof registerExpenseSchema>,
  ): Promise<ExpenseProps> {
    return this.registerExpenseUseCase.execute(user.userId, input);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: AuthenticatedUser, @Query('periodDays') periodDays?: string): Promise<FarmSummary> {
    return this.getFarmSummaryUseCase.execute(user.userId, periodDays ? Number(periodDays) : 30);
  }
}

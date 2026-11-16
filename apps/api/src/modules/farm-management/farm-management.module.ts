import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HarvestLotsModule } from '../harvest-lots/harvest-lots.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { OrdersModule } from '../orders/orders.module';
import { FarmManagementController } from './controllers/farm-management.controller';
import { EXPENSE_REPOSITORY } from './repositories/expense.repository';
import { MongoExpenseRepository } from './repositories/mongo-expense.repository';
import { ExpenseDocument, ExpenseSchema } from './schemas/expense.schema';
import { GetFarmSummaryUseCase } from './use-cases/get-farm-summary.use-case';
import { RegisterExpenseUseCase } from './use-cases/register-expense.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExpenseDocument.name, schema: ExpenseSchema }]),
    HarvestLotsModule,
    MarketplaceModule,
    OrdersModule,
  ],
  controllers: [FarmManagementController],
  providers: [{ provide: EXPENSE_REPOSITORY, useClass: MongoExpenseRepository }, RegisterExpenseUseCase, GetFarmSummaryUseCase],
  exports: [RegisterExpenseUseCase, GetFarmSummaryUseCase],
})
export class FarmManagementModule {}

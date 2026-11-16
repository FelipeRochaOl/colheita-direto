import { Inject, Injectable } from '@nestjs/common';
import { Expense, ExpenseCategory, ExpenseProps } from '../entities/expense.entity';
import { EXPENSE_REPOSITORY, ExpenseRepository } from '../repositories/expense.repository';

export interface RegisterExpenseInput {
  description: string;
  category: ExpenseCategory;
  amount: number;
  crop?: string;
  spentAt?: Date;
}

@Injectable()
export class RegisterExpenseUseCase {
  constructor(@Inject(EXPENSE_REPOSITORY) private readonly expenseRepository: ExpenseRepository) {}

  async execute(producerId: string, input: RegisterExpenseInput): Promise<ExpenseProps> {
    const expense = Expense.register({
      producerId,
      description: input.description,
      category: input.category,
      amount: input.amount,
      crop: input.crop?.toLowerCase() ?? null,
      spentAt: input.spentAt ?? new Date(),
    });
    await this.expenseRepository.save(expense);
    return expense.toSnapshot();
  }
}

import { Expense } from '../entities/expense.entity';

export const EXPENSE_REPOSITORY = Symbol('EXPENSE_REPOSITORY');

export interface ExpenseRepository {
  findByProducerSince(producerId: string, since: Date): Promise<Expense[]>;
  save(expense: Expense): Promise<void>;
}

import { generateEntityId } from '../../../shared/database/entity-id';

export const EXPENSE_CATEGORIES = ['SEEDS', 'FERTILIZER', 'PESTICIDE', 'LABOR', 'FUEL', 'PACKAGING', 'EQUIPMENT', 'OTHER'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface ExpenseProps {
  id: string;
  producerId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  crop: string | null;
  spentAt: Date;
  createdAt: Date;
}

/** Despesa do produtor, registrada pelo app ou por voz no WhatsApp. */
export class Expense {
  private constructor(private readonly props: ExpenseProps) {}

  static register(props: Omit<ExpenseProps, 'id' | 'createdAt'>): Expense {
    if (props.amount <= 0) throw new Error('Valor da despesa deve ser positivo');
    return new Expense({ ...props, id: generateEntityId(), createdAt: new Date() });
  }

  static restore(props: ExpenseProps): Expense {
    return new Expense(props);
  }

  get amount() {
    return this.props.amount;
  }

  toSnapshot(): ExpenseProps {
    return { ...this.props };
  }
}

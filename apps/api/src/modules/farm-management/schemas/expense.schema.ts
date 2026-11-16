import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EXPENSE_CATEGORIES } from '../entities/expense.entity';
import type { ExpenseCategory } from '../entities/expense.entity';

@Schema({ collection: 'expenses' })
export class ExpenseDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ required: true, index: true })
  producerId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: EXPENSE_CATEGORIES, required: true })
  category: ExpenseCategory;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, default: null })
  crop: string | null;

  @Prop({ required: true })
  spentAt: Date;

  @Prop({ required: true })
  createdAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(ExpenseDocument);
ExpenseSchema.index({ producerId: 1, spentAt: -1 });

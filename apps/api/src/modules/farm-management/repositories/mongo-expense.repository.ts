import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../entities/expense.entity';
import { ExpenseDocument } from '../schemas/expense.schema';
import { ExpenseRepository } from './expense.repository';

@Injectable()
export class MongoExpenseRepository implements ExpenseRepository {
  constructor(@InjectModel(ExpenseDocument.name) private readonly expenseModel: Model<ExpenseDocument>) {}

  async findByProducerSince(producerId: string, since: Date): Promise<Expense[]> {
    const documents = await this.expenseModel
      .find({ producerId, spentAt: { $gte: since } })
      .sort({ spentAt: -1 })
      .lean();
    return documents.map((document) =>
      Expense.restore({
        id: document._id,
        producerId: document.producerId,
        description: document.description,
        category: document.category,
        amount: document.amount,
        crop: document.crop,
        spentAt: document.spentAt,
        createdAt: document.createdAt,
      }),
    );
  }

  async save(expense: Expense): Promise<void> {
    const { id, ...fields } = expense.toSnapshot();
    await this.expenseModel.updateOne({ _id: id }, { $set: fields }, { upsert: true });
  }
}

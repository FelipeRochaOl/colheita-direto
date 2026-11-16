import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceReference } from '../entities/price-reference.entity';
import { PriceReferenceDocument } from '../schemas/price-reference.schema';
import { PriceReferenceRepository } from './price-reference.repository';

@Injectable()
export class MongoPriceReferenceRepository implements PriceReferenceRepository {
  constructor(
    @InjectModel(PriceReferenceDocument.name) private readonly priceReferenceModel: Model<PriceReferenceDocument>,
  ) {}

  async findLatestByCrop(normalizedCrop: string): Promise<PriceReference | null> {
    const document = await this.priceReferenceModel.findOne({ crop: normalizedCrop }).sort({ referenceDate: -1 }).lean();
    return document
      ? PriceReference.restore({
          crop: document.crop,
          pricePerKg: document.pricePerKg,
          source: document.source,
          referenceDate: document.referenceDate,
        })
      : null;
  }

  async save(priceReference: PriceReference): Promise<void> {
    const snapshot = priceReference.toSnapshot();
    await this.priceReferenceModel.updateOne(
      { crop: snapshot.crop, referenceDate: snapshot.referenceDate },
      { $set: snapshot },
      { upsert: true },
    );
  }
}

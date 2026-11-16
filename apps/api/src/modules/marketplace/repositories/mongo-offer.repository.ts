import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { Offer } from '../entities/offer.entity';
import { OfferDocument } from '../schemas/offer.schema';
import { OfferRepository, OfferSearchCriteria } from './offer.repository';

const SEARCH_RESULT_LIMIT = 60;

@Injectable()
export class MongoOfferRepository implements OfferRepository {
  constructor(@InjectModel(OfferDocument.name) private readonly offerModel: Model<OfferDocument>) {}

  async findById(offerId: string): Promise<Offer | null> {
    const document = await this.offerModel.findById(offerId).lean();
    return document ? this.toEntity(document) : null;
  }

  async search(criteria: OfferSearchCriteria): Promise<Offer[]> {
    const filter: FilterQuery<OfferDocument> = { isActive: true, availableBoxes: { $gt: 0 } };
    if (criteria.crop) filter.crop = criteria.crop.trim().toLowerCase();
    if (criteria.grades?.length) filter.grade = { $in: criteria.grades };
    if (criteria.maxPricePerBox) filter.pricePerBox = { $lte: criteria.maxPricePerBox };
    if (criteria.near) {
      filter.location = {
        $nearSphere: {
          $geometry: toGeoJsonPoint(criteria.near.location),
          $maxDistance: criteria.near.maxDistanceKm * 1000,
        },
      };
    }
    const query = this.offerModel.find(filter).limit(SEARCH_RESULT_LIMIT);
    if (!criteria.near) query.sort({ createdAt: -1 });
    const documents = await query.lean();
    return documents.map((document) => this.toEntity(document));
  }

  async findActiveByProducer(producerId: string): Promise<Offer[]> {
    const documents = await this.offerModel.find({ producerId, isActive: true }).lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(offer: Offer): Promise<void> {
    const { id, location, ...fields } = offer.toSnapshot();
    await this.offerModel.updateOne(
      { _id: id },
      { $set: { ...fields, location: toGeoJsonPoint(location) } },
      { upsert: true },
    );
  }

  async tryReserveBoxes(offerId: string, boxes: number): Promise<boolean> {
    const result = await this.offerModel.updateOne(
      { _id: offerId, isActive: true, availableBoxes: { $gte: boxes } },
      { $inc: { availableBoxes: -boxes } },
    );
    return result.modifiedCount === 1;
  }

  async releaseBoxes(offerId: string, boxes: number): Promise<void> {
    await this.offerModel.updateOne({ _id: offerId }, { $inc: { availableBoxes: boxes } });
  }

  private toEntity(document: OfferDocument): Offer {
    return Offer.restore({
      id: document._id,
      harvestLotId: document.harvestLotId,
      producerId: document.producerId,
      producerName: document.producerName,
      crop: document.crop,
      grade: document.grade,
      channel: document.channel,
      availableBoxes: document.availableBoxes,
      boxWeightKg: document.boxWeightKg,
      pricePerBox: document.pricePerBox,
      photoKeys: document.photoKeys,
      location: fromGeoJsonPoint(document.location),
      city: document.city,
      state: document.state,
      isActive: document.isActive,
      createdAt: document.createdAt,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { GeoPoint } from '@colheita/contracts';
import { fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { Donation } from '../entities/donation.entity';
import { DonationDocument } from '../schemas/donation.schema';
import { DonationRepository } from './donation.repository';

@Injectable()
export class MongoDonationRepository implements DonationRepository {
  constructor(@InjectModel(DonationDocument.name) private readonly donationModel: Model<DonationDocument>) {}

  async findById(donationId: string): Promise<Donation | null> {
    const document = await this.donationModel.findById(donationId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findOfferedNear(location: GeoPoint, maxDistanceKm: number): Promise<Donation[]> {
    const documents = await this.donationModel
      .find({
        status: 'OFFERED',
        pickupLocation: { $nearSphere: { $geometry: toGeoJsonPoint(location), $maxDistance: maxDistanceKm * 1000 } },
      })
      .limit(50)
      .lean();
    return documents.map((document) => this.toEntity(document));
  }

  async findByNgo(ngoId: string): Promise<Donation[]> {
    const documents = await this.donationModel.find({ ngoId }).sort({ createdAt: -1 }).limit(100).lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(donation: Donation): Promise<void> {
    const { id, pickupLocation, ...fields } = donation.toSnapshot();
    await this.donationModel.updateOne(
      { _id: id },
      { $set: { ...fields, pickupLocation: toGeoJsonPoint(pickupLocation) } },
      { upsert: true },
    );
  }

  async sumReceivedWeightKg(): Promise<number> {
    const [result] = await this.donationModel.aggregate<{ total: number }>([
      { $match: { status: 'RECEIVED' } },
      { $group: { _id: null, total: { $sum: '$receivedWeightKg' } } },
    ]);
    return result?.total ?? 0;
  }

  private toEntity(document: DonationDocument): Donation {
    return Donation.restore({
      id: document._id,
      harvestLotId: document.harvestLotId,
      producerId: document.producerId,
      producerName: document.producerName,
      crop: document.crop,
      quantityBoxes: document.quantityBoxes,
      estimatedWeightKg: document.estimatedWeightKg,
      pickupLocation: fromGeoJsonPoint(document.pickupLocation),
      status: document.status,
      ngoId: document.ngoId,
      receivedWeightKg: document.receivedWeightKg,
      acceptedAt: document.acceptedAt,
      receivedAt: document.receivedAt,
      createdAt: document.createdAt,
    });
  }
}

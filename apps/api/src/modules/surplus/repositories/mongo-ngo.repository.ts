import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { GeoPoint } from '@colheita/contracts';
import { fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { Ngo } from '../entities/ngo.entity';
import { NgoDocument } from '../schemas/ngo.schema';
import { NgoRepository } from './ngo.repository';

@Injectable()
export class MongoNgoRepository implements NgoRepository {
  constructor(@InjectModel(NgoDocument.name) private readonly ngoModel: Model<NgoDocument>) {}

  async findById(ngoId: string): Promise<Ngo | null> {
    const document = await this.ngoModel.findById(ngoId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findApprovedNear(location: GeoPoint, maxDistanceKm: number): Promise<Ngo[]> {
    const documents = await this.ngoModel
      .find({
        isApproved: true,
        location: { $nearSphere: { $geometry: toGeoJsonPoint(location), $maxDistance: maxDistanceKm * 1000 } },
      })
      .limit(10)
      .lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(ngo: Ngo): Promise<void> {
    const { id, location, ...fields } = ngo.toSnapshot();
    await this.ngoModel.updateOne(
      { _id: id },
      { $set: { ...fields, location: toGeoJsonPoint(location) } },
      { upsert: true },
    );
  }

  private toEntity(document: NgoDocument): Ngo {
    return Ngo.restore({
      id: document._id,
      name: document.name,
      document: document.document,
      phoneNumber: document.phoneNumber,
      location: fromGeoJsonPoint(document.location),
      address: document.address,
      pickupRadiusKm: document.pickupRadiusKm,
      isApproved: document.isApproved,
      createdAt: document.createdAt,
    });
  }
}

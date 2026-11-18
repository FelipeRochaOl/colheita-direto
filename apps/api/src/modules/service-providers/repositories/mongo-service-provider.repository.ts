import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { GeoPoint, ServiceType } from '@colheita/contracts';
import { calculateDistanceKm, fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { ServiceProvider } from '../entities/service-provider.entity';
import { ServiceProviderDocument } from '../schemas/service-provider.schema';
import { ServiceProviderRepository } from './service-provider.repository';

const MAX_SEARCH_RADIUS_METERS = 500_000;

@Injectable()
export class MongoServiceProviderRepository implements ServiceProviderRepository {
  constructor(
    @InjectModel(ServiceProviderDocument.name) private readonly serviceProviderModel: Model<ServiceProviderDocument>,
  ) {}

  async findById(serviceProviderId: string): Promise<ServiceProvider | null> {
    const document = await this.serviceProviderModel.findById(serviceProviderId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findApprovedServingLocation(serviceType: ServiceType, location: GeoPoint): Promise<ServiceProvider[]> {
    const documents = await this.serviceProviderModel
      .find({
        isApproved: true,
        serviceTypes: serviceType,
        baseLocation: {
          $nearSphere: { $geometry: toGeoJsonPoint(location), $maxDistance: MAX_SEARCH_RADIUS_METERS },
        },
      })
      .limit(20)
      .lean();
    return documents
      .filter(
        (document) =>
          calculateDistanceKm(fromGeoJsonPoint(document.baseLocation), location) <= document.serviceRadiusKm,
      )
      .map((document) => this.toEntity(document));
  }

  async save(serviceProvider: ServiceProvider): Promise<void> {
    const { id, baseLocation, ...fields } = serviceProvider.toSnapshot();
    await this.serviceProviderModel.updateOne(
      { _id: id },
      { $set: { ...fields, baseLocation: toGeoJsonPoint(baseLocation) } },
      { upsert: true },
    );
  }

  private toEntity(document: ServiceProviderDocument): ServiceProvider {
    return ServiceProvider.restore({
      id: document._id,
      name: document.name,
      document: document.document,
      phoneNumber: document.phoneNumber,
      serviceTypes: document.serviceTypes,
      offerings: (document.offerings ?? []).map((offering) => ({
        serviceType: offering.serviceType,
        price: offering.price,
        baseFee: offering.baseFee ?? 0,
        description: offering.description ?? null,
      })),
      baseLocation: fromGeoJsonPoint(document.baseLocation),
      serviceRadiusKm: document.serviceRadiusKm,
      vehicleCapacityKg: document.vehicleCapacityKg,
      hasRefrigeration: document.hasRefrigeration,
      isApproved: document.isApproved,
      paymentWalletId: document.paymentWalletId,
      createdAt: document.createdAt,
    });
  }
}

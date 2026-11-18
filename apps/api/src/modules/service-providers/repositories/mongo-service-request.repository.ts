import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { fromGeoJsonPoint, toGeoJsonPoint } from '../../../shared/geo/geo-distance';
import { ServiceRequest } from '../entities/service-request.entity';
import { ServiceRequestDocument } from '../schemas/service-request.schema';
import { ServiceRequestRepository } from './service-request.repository';

@Injectable()
export class MongoServiceRequestRepository implements ServiceRequestRepository {
  constructor(
    @InjectModel(ServiceRequestDocument.name) private readonly serviceRequestModel: Model<ServiceRequestDocument>,
  ) {}

  async findById(serviceRequestId: string): Promise<ServiceRequest | null> {
    const document = await this.serviceRequestModel.findById(serviceRequestId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findByParticipant(userId: string): Promise<ServiceRequest[]> {
    const documents = await this.serviceRequestModel
      .find({ $or: [{ producerId: userId }, { serviceProviderId: userId }] })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return documents.map((document) => this.toEntity(document));
  }

  async save(serviceRequest: ServiceRequest): Promise<void> {
    const { id, pickupLocation, ...fields } = serviceRequest.toSnapshot();
    await this.serviceRequestModel.updateOne(
      { _id: id },
      { $set: { ...fields, pickupLocation: toGeoJsonPoint(pickupLocation) } },
      { upsert: true },
    );
  }

  private toEntity(document: ServiceRequestDocument): ServiceRequest {
    return ServiceRequest.restore({
      id: document._id,
      producerId: document.producerId,
      serviceProviderId: document.serviceProviderId,
      serviceType: document.serviceType,
      quantity: document.quantity,
      estimatedTotal: document.estimatedTotal,
      scheduledFor: document.scheduledFor,
      notes: document.notes,
      pickupLocation: fromGeoJsonPoint(document.pickupLocation),
      status: document.status,
      createdAt: document.createdAt,
      respondedAt: document.respondedAt,
    });
  }
}

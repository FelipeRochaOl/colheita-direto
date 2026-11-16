import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import { UserDocument } from '../schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(@InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>) {}

  async findById(userId: string): Promise<User | null> {
    const document = await this.userModel.findById(userId).lean();
    return document ? this.toEntity(document) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const document = await this.userModel.findOne({ phoneNumber }).lean();
    return document ? this.toEntity(document) : null;
  }

  async save(user: User): Promise<void> {
    const { id, ...fields } = user.toSnapshot();
    await this.userModel.updateOne({ _id: id }, { $set: fields }, { upsert: true });
  }

  private toEntity(document: UserDocument): User {
    return User.restore({
      id: document._id,
      phoneNumber: document.phoneNumber,
      name: document.name,
      roles: document.roles,
      privacyConsent: document.privacyConsent,
      lastWhatsAppInboundAt: document.lastWhatsAppInboundAt,
      createdAt: document.createdAt,
    });
  }
}

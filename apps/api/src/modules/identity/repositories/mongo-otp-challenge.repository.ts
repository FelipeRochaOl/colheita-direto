import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OtpChallenge } from '../entities/otp-challenge.entity';
import { OtpChallengeDocument } from '../schemas/otp-challenge.schema';
import { OtpChallengeRepository } from './otp-challenge.repository';

@Injectable()
export class MongoOtpChallengeRepository implements OtpChallengeRepository {
  constructor(
    @InjectModel(OtpChallengeDocument.name) private readonly otpChallengeModel: Model<OtpChallengeDocument>,
  ) {}

  async findByPhoneNumber(phoneNumber: string): Promise<OtpChallenge | null> {
    const document = await this.otpChallengeModel.findOne({ phoneNumber }).lean();
    return document
      ? OtpChallenge.restore({
          phoneNumber: document.phoneNumber,
          codeHash: document.codeHash,
          expiresAt: document.expiresAt,
          failedAttempts: document.failedAttempts,
        })
      : null;
  }

  async save(challenge: OtpChallenge): Promise<void> {
    const snapshot = challenge.toSnapshot();
    await this.otpChallengeModel.updateOne({ phoneNumber: snapshot.phoneNumber }, { $set: snapshot }, { upsert: true });
  }

  async deleteByPhoneNumber(phoneNumber: string): Promise<void> {
    await this.otpChallengeModel.deleteOne({ phoneNumber });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from '../entities/conversation.entity';
import { ConversationDocument } from '../schemas/conversation.schema';
import { ConversationRepository } from './conversation.repository';

@Injectable()
export class MongoConversationRepository implements ConversationRepository {
  constructor(
    @InjectModel(ConversationDocument.name) private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findByPhoneNumber(phoneNumber: string): Promise<Conversation | null> {
    const document = await this.conversationModel.findOne({ phoneNumber }).lean();
    return document
      ? Conversation.restore({
          phoneNumber: document.phoneNumber,
          turns: document.turns,
          pendingPhotoKeys: document.pendingPhotoKeys,
          updatedAt: document.updatedAt,
        })
      : null;
  }

  async save(conversation: Conversation): Promise<void> {
    const snapshot = conversation.toSnapshot();
    await this.conversationModel.updateOne({ phoneNumber: snapshot.phoneNumber }, { $set: snapshot }, { upsert: true });
  }
}

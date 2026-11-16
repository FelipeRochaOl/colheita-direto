import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProcessedInboundMessageDocument } from '../schemas/processed-inbound-message.schema';
import { InboundMessageLedger } from './inbound-message-ledger';

const DUPLICATE_KEY_ERROR_CODE = 11000;

@Injectable()
export class MongoInboundMessageLedger implements InboundMessageLedger {
  constructor(
    @InjectModel(ProcessedInboundMessageDocument.name)
    private readonly processedMessageModel: Model<ProcessedInboundMessageDocument>,
  ) {}

  async tryRegister(messageId: string): Promise<boolean> {
    try {
      await this.processedMessageModel.create({ messageId, processedAt: new Date() });
      return true;
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR_CODE) return false;
      throw error;
    }
  }
}

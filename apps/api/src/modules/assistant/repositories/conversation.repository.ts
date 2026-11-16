import { Conversation } from '../entities/conversation.entity';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

export interface ConversationRepository {
  findByPhoneNumber(phoneNumber: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
}

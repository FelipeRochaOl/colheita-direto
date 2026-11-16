import { Conversation } from '../entities/conversation.entity';

/** Quem está conversando: as tools sempre agem em nome deste produtor. */
export interface AssistantToolContext {
  producerId: string;
  conversation: Conversation;
}

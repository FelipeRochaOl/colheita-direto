import type Anthropic from '@anthropic-ai/sdk';

export const LANGUAGE_MODEL_CLIENT = Symbol('LANGUAGE_MODEL_CLIENT');

export interface LanguageModelRequest {
  systemPrompt: string;
  tools: Anthropic.Tool[];
  messages: Anthropic.MessageParam[];
}

/** Porta para o modelo de linguagem. O agente não conhece Bedrock nem SDK: só esta interface. */
export interface LanguageModelClient {
  createMessage(request: LanguageModelRequest): Promise<Anthropic.Message>;
}

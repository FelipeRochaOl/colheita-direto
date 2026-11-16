import type Anthropic from '@anthropic-ai/sdk';
import { AnthropicBedrockMantle } from '@anthropic-ai/bedrock-sdk';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';
import { LanguageModelClient, LanguageModelRequest } from './language-model-client';

/** Claude via Amazon Bedrock (cliente Mantle do SDK oficial da Anthropic). */
@Injectable()
export class BedrockClaudeClient implements LanguageModelClient {
  private readonly claudeClient: AnthropicBedrockMantle;
  private readonly modelId: string;

  constructor(appConfig: AppConfigService) {
    this.claudeClient = new AnthropicBedrockMantle({ awsRegion: appConfig.get('BEDROCK_REGION') });
    this.modelId = appConfig.get('CLAUDE_MODEL_ID');
  }

  createMessage(request: LanguageModelRequest): Promise<Anthropic.Message> {
    return this.claudeClient.messages.create({
      model: this.modelId,
      max_tokens: 16000,
      system: request.systemPrompt,
      tools: request.tools,
      // Conversa curta no WhatsApp: esforço baixo responde rápido e custa menos.
      output_config: { effort: 'low' },
      messages: request.messages,
    });
  }
}

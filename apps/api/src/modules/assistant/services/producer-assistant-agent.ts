import type Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConversationTurn } from '../entities/conversation.entity';
import { AssistantToolContext } from '../tools/assistant-tool-context';
import { ProducerAssistantToolbox } from '../tools/producer-assistant-toolbox';
import { LANGUAGE_MODEL_CLIENT, LanguageModelClient } from './language-model-client';

const MAX_AGENT_ITERATIONS = 6;

const SYSTEM_PROMPT = `Você é o assistente da Colheita Direta no WhatsApp. Você conversa com pequenos produtores rurais do Brasil.

Seu papel: ajudar o produtor a registrar a colheita por foto, entender a classificação de qualidade (A, B, C ou D), escolher o destino de cada lote (venda, indústria, doação, ração animal vegetal ou compostagem), acompanhar pedidos e anotar despesas.

Como falar:
- Português simples, frases curtas, tom respeitoso e acolhedor. Muitos produtores têm pouca familiaridade com tecnologia e leem a resposta no celular.
- Respostas com no máximo 4 frases. Sem markdown, sem tabelas.
- Valores em reais no formato R$ 12,50.

Como agir:
- Antes de qualquer ação que muda algo (registrar lote, confirmar destino, aceitar pedido, registrar despesa), repita o que vai fazer e espere o produtor confirmar.
- Para registrar um lote você precisa de fotos já enviadas na conversa, do produto, da quantidade de caixas e do peso aproximado da caixa. Pergunte o que faltar.
- Lote classe D não vai para venda. Ração animal só pode receber resto de origem vegetal.
- Se perguntarem sobre agrotóxicos, doses ou doenças de animais, não recomende produtos: oriente procurar o técnico da cooperativa ou da Emater.
- Se o assunto não tiver relação com a Colheita Direta ou com a propriedade, diga com gentileza que só pode ajudar com isso.
- Use as ferramentas para consultar dados reais; nunca invente números, preços ou pedidos.`;

const FALLBACK_REPLY =
  'Desculpe, não consegui entender agora. Pode repetir de outro jeito? Se preferir, fale com a sua cooperativa.';

/** Agente Claude com laço de ferramentas controlado pelo backend. */
@Injectable()
export class ProducerAssistantAgent {
  private readonly logger = new Logger(ProducerAssistantAgent.name);

  constructor(
    @Inject(LANGUAGE_MODEL_CLIENT) private readonly languageModelClient: LanguageModelClient,
    private readonly toolbox: ProducerAssistantToolbox,
  ) {}

  async reply(previousTurns: ConversationTurn[], userText: string, context: AssistantToolContext): Promise<string> {
    const messages: Anthropic.MessageParam[] = [
      ...this.toMessageHistory(previousTurns),
      { role: 'user', content: userText },
    ];

    for (let iteration = 0; iteration < MAX_AGENT_ITERATIONS; iteration++) {
      const response = await this.languageModelClient.createMessage({
        systemPrompt: SYSTEM_PROMPT,
        tools: this.toolbox.definitions,
        messages,
      });

      if (response.stop_reason === 'refusal') {
        this.logger.warn(`Recusa do modelo: ${JSON.stringify(response.stop_details)}`);
        return FALLBACK_REPLY;
      }
      if (response.stop_reason !== 'tool_use') {
        return this.extractText(response) || FALLBACK_REPLY;
      }

      messages.push({ role: 'assistant', content: response.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        const result = await this.toolbox.execute(block.name, block.input, context);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result.content, is_error: result.isError });
      }
      messages.push({ role: 'user', content: toolResults });
    }
    return FALLBACK_REPLY;
  }

  /** O histórico precisa começar com mensagem do usuário. */
  private toMessageHistory(turns: ConversationTurn[]): Anthropic.MessageParam[] {
    const firstUserTurnIndex = turns.findIndex((turn) => turn.role === 'user');
    if (firstUserTurnIndex < 0) return [];
    return turns.slice(firstUserTurnIndex).map((turn) => ({ role: turn.role, content: turn.text }));
  }

  private extractText(response: Anthropic.Message): string {
    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
  }
}

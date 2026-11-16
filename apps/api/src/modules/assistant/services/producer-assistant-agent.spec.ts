import type Anthropic from '@anthropic-ai/sdk';
import { Conversation } from '../entities/conversation.entity';
import { ProducerAssistantToolbox } from '../tools/producer-assistant-toolbox';
import { LanguageModelClient, LanguageModelRequest } from './language-model-client';
import { ProducerAssistantAgent } from './producer-assistant-agent';

function modelMessage(content: Anthropic.ContentBlock[], stopReason: Anthropic.Message['stop_reason']): Anthropic.Message {
  return { content, stop_reason: stopReason } as Anthropic.Message;
}

/** Modelo falso: devolve as respostas na ordem e guarda cada requisição recebida. */
class ScriptedLanguageModelClient implements LanguageModelClient {
  readonly receivedRequests: LanguageModelRequest[] = [];

  constructor(private readonly scriptedResponses: Anthropic.Message[]) {}

  async createMessage(request: LanguageModelRequest): Promise<Anthropic.Message> {
    this.receivedRequests.push({ ...request, messages: [...request.messages] });
    return this.scriptedResponses.shift()!;
  }
}

describe('ProducerAssistantAgent', () => {
  const context = { producerId: 'producer-1', conversation: Conversation.start('+5511911110001') };

  it('executa a tool pedida pelo modelo, devolve o resultado e responde com o texto final', async () => {
    const languageModel = new ScriptedLanguageModelClient([
      modelMessage(
        [{ type: 'tool_use', id: 'toolu_1', name: 'get_farm_summary', input: {} } as Anthropic.ToolUseBlock],
        'tool_use',
      ),
      modelMessage([{ type: 'text', text: 'Seu lucro no mês foi R$ 572,80.' } as Anthropic.TextBlock], 'end_turn'),
    ]);
    const execute = jest.fn().mockResolvedValue({ content: '{"profit":572.8}', isError: false });
    const agent = new ProducerAssistantAgent(languageModel, {
      definitions: [],
      execute,
    } as unknown as ProducerAssistantToolbox);

    const reply = await agent.reply([], 'quanto lucrei?', context);

    expect(reply).toBe('Seu lucro no mês foi R$ 572,80.');
    expect(execute).toHaveBeenCalledWith('get_farm_summary', {}, context);
    const secondRequest = languageModel.receivedRequests[1];
    expect(secondRequest.messages.at(-1)).toEqual({
      role: 'user',
      content: [{ type: 'tool_result', tool_use_id: 'toolu_1', content: '{"profit":572.8}', is_error: false }],
    });
  });

  it('responde com mensagem segura quando o modelo recusa', async () => {
    const languageModel = new ScriptedLanguageModelClient([modelMessage([], 'refusal')]);
    const agent = new ProducerAssistantAgent(languageModel, { definitions: [], execute: jest.fn() } as unknown as ProducerAssistantToolbox);

    await expect(agent.reply([], 'oi', context)).resolves.toContain('Desculpe');
  });

  it('o histórico enviado ao modelo sempre começa com mensagem do usuário', async () => {
    const languageModel = new ScriptedLanguageModelClient([
      modelMessage([{ type: 'text', text: 'ok' } as Anthropic.TextBlock], 'end_turn'),
    ]);
    const agent = new ProducerAssistantAgent(languageModel, { definitions: [], execute: jest.fn() } as unknown as ProducerAssistantToolbox);

    await agent.reply(
      [
        { role: 'assistant', text: 'mensagem antiga do assistente' },
        { role: 'user', text: 'oi' },
        { role: 'assistant', text: 'olá' },
      ],
      'tudo bem?',
      context,
    );

    expect(languageModel.receivedRequests[0].messages[0]).toEqual({ role: 'user', content: 'oi' });
  });
});

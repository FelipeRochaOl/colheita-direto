import type Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { LOT_DESTINATIONS } from '@colheita/contracts';
import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '../../farm-management/entities/expense.entity';
import { GetFarmSummaryUseCase } from '../../farm-management/use-cases/get-farm-summary.use-case';
import { RegisterExpenseUseCase } from '../../farm-management/use-cases/register-expense.use-case';
import { CreateHarvestLotUseCase } from '../../harvest-lots/use-cases/create-harvest-lot.use-case';
import { ListProducerHarvestLotsUseCase } from '../../harvest-lots/use-cases/list-producer-harvest-lots.use-case';
import { ConfirmLotDestinationUseCase } from '../../lot-routing/use-cases/confirm-lot-destination.use-case';
import { AcceptOrderUseCase } from '../../orders/use-cases/accept-order.use-case';
import { ListMyOrdersUseCase } from '../../orders/use-cases/list-my-orders.use-case';
import { AssistantToolContext } from './assistant-tool-context';

const createHarvestLotInputSchema = z.object({
  crop: z.string().min(2),
  quantity_boxes: z.number().int().positive(),
  box_weight_kg: z.number().positive(),
});
const confirmLotDestinationInputSchema = z.object({
  harvest_lot_id: z.string(),
  destination: z.enum(LOT_DESTINATIONS),
  price_per_box: z.number().positive().nullable(),
});
const registerExpenseInputSchema = z.object({
  description: z.string().min(2),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive(),
  crop: z.string().nullable(),
});
const acceptOrderInputSchema = z.object({ order_id: z.string() });
const emptyInputSchema = z.object({});

/**
 * Ferramentas que o Claude pode usar na conversa com o produtor.
 * Cada tool apenas valida a entrada e chama um use-case existente (nenhuma regra de negócio aqui).
 */
@Injectable()
export class ProducerAssistantToolbox {
  constructor(
    private readonly createHarvestLotUseCase: CreateHarvestLotUseCase,
    private readonly listProducerHarvestLotsUseCase: ListProducerHarvestLotsUseCase,
    private readonly confirmLotDestinationUseCase: ConfirmLotDestinationUseCase,
    private readonly registerExpenseUseCase: RegisterExpenseUseCase,
    private readonly getFarmSummaryUseCase: GetFarmSummaryUseCase,
    private readonly listMyOrdersUseCase: ListMyOrdersUseCase,
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
  ) {}

  readonly definitions: Anthropic.Tool[] = [
    {
      name: 'create_harvest_lot',
      description:
        'Registra um lote de colheita usando as fotos que o produtor já enviou nesta conversa. A classificação de qualidade chega em seguida por mensagem. Use só depois de saber cultura, quantidade de caixas e peso aproximado da caixa, e depois de o produtor confirmar.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {
          crop: { type: 'string', description: 'Produto, ex.: tomate, alface, banana' },
          quantity_boxes: { type: 'integer', description: 'Número de caixas' },
          box_weight_kg: { type: 'number', description: 'Peso aproximado de uma caixa em kg' },
        },
        required: ['crop', 'quantity_boxes', 'box_weight_kg'],
        additionalProperties: false,
      },
    },
    {
      name: 'list_my_harvest_lots',
      description: 'Lista os lotes recentes do produtor com classe de qualidade, destino sugerido e preço sugerido.',
      strict: true,
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    },
    {
      name: 'confirm_lot_destination',
      description:
        'Confirma para onde vai um lote já classificado: MARKETPLACE, DISCOUNT_MARKETPLACE, INDUSTRY, DONATION, ANIMAL_FEED ou COMPOST. Só chame depois que o produtor disser claramente que concorda. price_per_box null usa o preço sugerido.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {
          harvest_lot_id: { type: 'string' },
          destination: { type: 'string', enum: [...LOT_DESTINATIONS] },
          price_per_box: { type: ['number', 'null'] },
        },
        required: ['harvest_lot_id', 'destination', 'price_per_box'],
        additionalProperties: false,
      },
    },
    {
      name: 'register_expense',
      description: 'Registra uma despesa da propriedade (ex.: "gastei 200 reais de adubo"). Confirme o valor antes.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          category: { type: 'string', enum: [...EXPENSE_CATEGORIES] },
          amount: { type: 'number', description: 'Valor em reais' },
          crop: { type: ['string', 'null'], description: 'Cultura relacionada, se houver' },
        },
        required: ['description', 'category', 'amount', 'crop'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_farm_summary',
      description: 'Resumo dos últimos 30 dias: receitas, despesas, lucro e estoque por cultura.',
      strict: true,
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    },
    {
      name: 'list_my_orders',
      description: 'Lista os pedidos recebidos pelo produtor e o status de cada um.',
      strict: true,
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    },
    {
      name: 'accept_order',
      description: 'Aceita um pedido pago. Só chame depois que o produtor confirmar.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: { order_id: { type: 'string' } },
        required: ['order_id'],
        additionalProperties: false,
      },
    },
  ];

  /** Executa a tool e devolve um JSON com o resultado (ou um erro legível para o modelo). */
  async execute(toolName: string, rawInput: unknown, context: AssistantToolContext): Promise<{ content: string; isError: boolean }> {
    try {
      const result = await this.dispatch(toolName, rawInput, context);
      return { content: JSON.stringify(result), isError: false };
    } catch (error) {
      return { content: JSON.stringify({ error: (error as Error).message }), isError: true };
    }
  }

  private async dispatch(toolName: string, rawInput: unknown, context: AssistantToolContext): Promise<unknown> {
    switch (toolName) {
      case 'create_harvest_lot': {
        const input = createHarvestLotInputSchema.parse(rawInput);
        const photoKeys = context.conversation.takePendingPhotos();
        if (!photoKeys.length) throw new Error('Nenhuma foto recebida ainda. Peça ao produtor para enviar fotos do lote.');
        const harvestLot = await this.createHarvestLotUseCase.execute(context.producerId, {
          crop: input.crop,
          quantityBoxes: input.quantity_boxes,
          boxWeightKg: input.box_weight_kg,
          photoKeys: photoKeys.slice(0, 5),
          harvestedAt: new Date().toISOString(),
        });
        return { harvest_lot_id: harvestLot.id, status: 'Classificação em andamento; o resultado chega em instantes.' };
      }
      case 'list_my_harvest_lots': {
        emptyInputSchema.parse(rawInput);
        const lots = await this.listProducerHarvestLotsUseCase.execute(context.producerId);
        return lots.slice(0, 10).map((lot) => ({
          harvest_lot_id: lot.id,
          crop: lot.crop,
          boxes: lot.quantityBoxes,
          status: lot.status,
          grade: lot.classification?.grade ?? null,
          defects: lot.classification?.defects ?? [],
          destination: lot.destination,
          suggested_price_per_box: lot.suggestedPricePerBox,
        }));
      }
      case 'confirm_lot_destination': {
        const input = confirmLotDestinationInputSchema.parse(rawInput);
        return this.confirmLotDestinationUseCase.execute(context.producerId, input.harvest_lot_id, {
          destination: input.destination,
          pricePerBox: input.price_per_box ?? undefined,
        });
      }
      case 'register_expense': {
        const input = registerExpenseInputSchema.parse(rawInput);
        return this.registerExpenseUseCase.execute(context.producerId, {
          description: input.description,
          category: input.category,
          amount: input.amount,
          crop: input.crop ?? undefined,
        });
      }
      case 'get_farm_summary':
        emptyInputSchema.parse(rawInput);
        return this.getFarmSummaryUseCase.execute(context.producerId);
      case 'list_my_orders': {
        emptyInputSchema.parse(rawInput);
        const orders = await this.listMyOrdersUseCase.execute(context.producerId);
        return orders
          .filter((order) => order.producerId === context.producerId)
          .slice(0, 10)
          .map((order) => ({ order_id: order.id, status: order.status, items: order.items, total: order.total }));
      }
      case 'accept_order': {
        const input = acceptOrderInputSchema.parse(rawInput);
        const order = await this.acceptOrderUseCase.execute(context.producerId, input.order_id);
        return { order_id: order.id, status: order.status };
      }
      default:
        throw new Error(`Ferramenta desconhecida: ${toolName}`);
    }
  }
}

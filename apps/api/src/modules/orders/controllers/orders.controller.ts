import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createOrderSchema } from '@colheita/contracts';
import type { CreateOrderInput, Order } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { AcceptOrderUseCase } from '../use-cases/accept-order.use-case';
import { ConfirmOrderDeliveryUseCase } from '../use-cases/confirm-order-delivery.use-case';
import { CreateOrderUseCase } from '../use-cases/create-order.use-case';
import { ListMyOrdersUseCase } from '../use-cases/list-my-orders.use-case';

@ApiTags('Pedidos')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listMyOrdersUseCase: ListMyOrdersUseCase,
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
    private readonly confirmOrderDeliveryUseCase: ConfirmOrderDeliveryUseCase,
  ) {}

  @Post()
  @Roles('buyer')
  @ApiBodyFromSchema(createOrderSchema)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(createOrderSchema) input: CreateOrderInput,
  ): Promise<Order[]> {
    return this.createOrderUseCase.execute(user.userId, input);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<Order[]> {
    return this.listMyOrdersUseCase.execute(user.userId);
  }

  @Post(':orderId/acceptance')
  @Roles('producer')
  accept(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string): Promise<Order> {
    return this.acceptOrderUseCase.execute(user.userId, orderId);
  }

  @Post(':orderId/delivery-confirmation')
  @Roles('buyer')
  confirmDelivery(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string): Promise<Order> {
    return this.confirmOrderDeliveryUseCase.execute(user.userId, orderId);
  }
}

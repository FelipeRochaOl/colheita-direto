import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuyersModule } from '../buyers/buyers.module';
import { HarvestLotsModule } from '../harvest-lots/harvest-lots.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProducersModule } from '../producers/producers.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { OrdersController } from './controllers/orders.controller';
import { PaymentWebhooksController } from './controllers/payment-webhooks.controller';
import { MongoOrderRepository } from './repositories/mongo-order.repository';
import { ORDER_REPOSITORY } from './repositories/order.repository';
import { OrderDocument, OrderSchema } from './schemas/order.schema';
import { IntermediaryServicePlanner } from './services/intermediary-service-planner';
import { OrderPresenter } from './services/order-presenter';
import { AcceptOrderUseCase } from './use-cases/accept-order.use-case';
import { ConfirmOrderDeliveryUseCase } from './use-cases/confirm-order-delivery.use-case';
import { CreateOrderUseCase } from './use-cases/create-order.use-case';
import { HandlePaymentConfirmedUseCase } from './use-cases/handle-payment-confirmed.use-case';
import { ListMyOrdersUseCase } from './use-cases/list-my-orders.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrderDocument.name, schema: OrderSchema }]),
    BuyersModule,
    ProducersModule,
    MarketplaceModule,
    HarvestLotsModule,
    PaymentsModule,
    ServiceProvidersModule,
  ],
  controllers: [OrdersController, PaymentWebhooksController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: MongoOrderRepository },
    OrderPresenter,
    IntermediaryServicePlanner,
    CreateOrderUseCase,
    HandlePaymentConfirmedUseCase,
    AcceptOrderUseCase,
    ConfirmOrderDeliveryUseCase,
    ListMyOrdersUseCase,
  ],
  exports: [ORDER_REPOSITORY, ListMyOrdersUseCase, AcceptOrderUseCase],
})
export class OrdersModule {}

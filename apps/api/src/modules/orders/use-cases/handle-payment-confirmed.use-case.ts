import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../identity/repositories/user.repository';
import { NotificationService } from '../../notifications/services/notification.service';
import { ORDER_REPOSITORY, OrderRepository } from '../repositories/order.repository';

/** Chamado pelo webhook do Asaas. Idempotente: pagamento repetido não muda nada. */
@Injectable()
export class HandlePaymentConfirmedUseCase {
  private readonly logger = new Logger(HandlePaymentConfirmedUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: OrderRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.warn(`Pagamento para pedido inexistente ${orderId}`);
      return;
    }
    if (order.isPaid()) return;

    order.markPaid();
    await this.orderRepository.save(order);

    const producerUser = await this.userRepository.findById(order.producerId);
    if (producerUser) {
      const itemsText = order.items.map((item) => `${item.boxes} cx de ${item.crop}`).join(', ');
      await this.notificationService.notify(producerUser.toNotificationRecipient(), {
        text: `Novo pedido pago: ${itemsText}. Você recebe R$ ${order.producerPayout.toFixed(2).replace('.', ',')}.`,
        buttons: [{ id: `accept-order:${order.id}`, title: 'Aceitar pedido' }],
        template: { name: 'novo_pedido', languageCode: 'pt_BR', bodyParameters: [itemsText] },
      });
    }
  }
}

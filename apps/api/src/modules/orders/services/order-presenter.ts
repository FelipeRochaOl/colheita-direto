import { Injectable } from '@nestjs/common';
import type { Order as OrderView } from '@colheita/contracts';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderPresenter {
  present(order: Order): OrderView {
    const snapshot = order.toSnapshot();
    return {
      id: snapshot.id,
      buyerId: snapshot.buyerId,
      producerId: snapshot.producerId,
      items: snapshot.items.map((item) => ({
        offerId: item.offerId,
        crop: item.crop,
        boxes: item.boxes,
        pricePerBox: item.pricePerBox,
      })),
      productsTotal: snapshot.productsTotal,
      servicesTotal: snapshot.servicesTotal,
      platformFee: snapshot.platformFee,
      total: snapshot.total,
      status: snapshot.status,
      payment: snapshot.payment
        ? {
            pixQrCodeImage: snapshot.payment.pixQrCodeImage,
            pixCopyPaste: snapshot.payment.pixCopyPaste,
            invoiceUrl: snapshot.payment.invoiceUrl,
          }
        : null,
      createdAt: snapshot.createdAt.toISOString(),
    };
  }
}

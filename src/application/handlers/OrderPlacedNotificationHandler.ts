import type { OrderPlaced } from
  "../../domain/order/events/OrderPlaced";

import type { OrderRepository } from
  "../../domain/order/OrderRepository";

import type { NotificationService } from
  "../ports/NotificationService";

export class OrderPlacedNotificationHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(event: OrderPlaced): Promise<void> {
    const order = await this.orderRepository.findById(
      event.orderId,
    );

    if (!order) {
      throw new Error(`注文が見つかりません: ${event.orderId}`);
    }

    await this.notificationService.notify(order);
  }
}

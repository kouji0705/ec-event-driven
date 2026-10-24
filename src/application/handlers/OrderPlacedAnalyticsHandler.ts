import type { OrderPlaced } from
  "../../domain/order/events/OrderPlaced";

import type { OrderRepository } from
  "../../domain/order/OrderRepository";

import type { AnalyticsService } from
  "../ports/AnalyticsService";

export class OrderPlacedAnalyticsHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async handle(event: OrderPlaced): Promise<void> {
    const order = await this.orderRepository.findById(
      event.orderId,
    );

    if (!order) {
      throw new Error(`注文が見つかりません: ${event.orderId}`);
    }

    await this.analyticsService.record(order);
  }
}

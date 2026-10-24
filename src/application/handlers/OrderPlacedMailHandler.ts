import type { OrderPlaced } from
  "../../domain/order/events/OrderPlaced";

import type { OrderRepository } from
  "../../domain/order/OrderRepository";

import type { MailService } from
  "../ports/MailService";

import type { FailedMailRepository } from
  "../ports/FailedMailRepository";

export class OrderPlacedMailHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    private readonly failedMailRepository: FailedMailRepository,
  ) {}

  async handle(event: OrderPlaced): Promise<void> {
    const order = await this.orderRepository.findById(
      event.orderId,
    );

    if (!order) {
      throw new Error(`注文が見つかりません: ${event.orderId}`);
    }

    try {
      await this.mailService.send(order);
    } catch (error) {
      // Step 03で実装した失敗記録
      await this.failedMailRepository.save(order.id);

      console.error("[Mail] 送信失敗:", error);
    }
  }
}

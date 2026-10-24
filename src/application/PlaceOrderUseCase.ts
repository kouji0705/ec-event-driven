import { randomUUID } from "node:crypto";
import { Order, type OrderItem } from "../domain/order/Order";
import type { OrderRepository } from "../domain/order/OrderRepository";

import type { MailService } from "./ports/MailService";
import type { AnalyticsService } from "./ports/AnalyticsService";
import type { NotificationService } from "./ports/NotificationService";

export type PlaceOrderInput = {
  items: OrderItem[];
};

export type PlaceOrderOutput = {
  orderId: string;
  totalPrice: number;
  status: string;
};

export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    // Step 02: 追加
    private readonly mailService: MailService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    input: PlaceOrderInput,
  ): Promise<PlaceOrderOutput> {
    const orderId = randomUUID();

    const order = Order.create(orderId, input.items);

    // Step 01: 注文の保存
    await this.orderRepository.save(order);

    // Step 02: 注文完了後の処理を追加
    await this.mailService.send(order);
    await this.analyticsService.record(order);
    await this.notificationService.notify(order);

    return {
      orderId: order.id,
      totalPrice: order.getTotalPrice(),
      status: order.status,
    };
  }
}

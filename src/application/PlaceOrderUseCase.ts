import { randomUUID } from "node:crypto";
import { Order, type OrderItem } from "../domain/order/Order";
import type { OrderRepository } from "../domain/order/OrderRepository";

import type { MailService } from "./ports/MailService";
import type { AnalyticsService } from "./ports/AnalyticsService";
import type { NotificationService } from "./ports/NotificationService";
import type { FailedMailRepository } from "./ports/FailedMailRepository";

export type PlaceOrderInput = {
  items: OrderItem[];
};

export type PlaceOrderOutput = {
  orderId: string;
  totalPrice: number;
  status: string;
  mailStatus: "SENT" | "FAILED";
};

export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationService: NotificationService,
    private readonly failedMailRepository: FailedMailRepository,
  ) {}

  async execute(
    input: PlaceOrderInput,
  ): Promise<PlaceOrderOutput> {
    const orderId = randomUUID();
    const order = Order.create(orderId, input.items);

    // 注文を保存
    await this.orderRepository.save(order);

    // メール送信
    let mailStatus: "SENT" | "FAILED" = "SENT";

    try {
      await this.mailService.send(order);
    } catch (error) {
      mailStatus = "FAILED";

      // 失敗した注文IDを記録
      await this.failedMailRepository.save(order.id);

      console.error("[Mail] 送信失敗:", error);
    }

    // メール送信に失敗しても続行
    await this.analyticsService.record(order);
    await this.notificationService.notify(order);

    return {
      orderId: order.id,
      totalPrice: order.getTotalPrice(),
      status: order.status,
      mailStatus,
    };
  }
}
  
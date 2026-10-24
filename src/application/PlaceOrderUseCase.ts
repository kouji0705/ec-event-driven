import { randomUUID } from "node:crypto";

import { Order, type OrderItem } from
  "../domain/order/Order";

import type { OrderRepository } from
  "../domain/order/OrderRepository";

import type { EventBus } from "./ports/EventBus";

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
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    input: PlaceOrderInput,
  ): Promise<PlaceOrderOutput> {
    const orderId = randomUUID();

    const order = Order.create(orderId, input.items);

    // 注文を保存
    await this.orderRepository.save(order);

    // 注文完了イベントを発行
    await this.eventBus.publish({
      type: "OrderPlaced",
      orderId: order.id,
      totalAmount: order.getTotalPrice(),
    });

    return {
      orderId: order.id,
      totalPrice: order.getTotalPrice(),
      status: order.status,
    };
  }
}
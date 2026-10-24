import { randomUUID } from "crypto"
import { Order, type OrderItem } from "../domain/order/Order";
import type { OrderRepository } from "../domain/order/OrderRepository";

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
  ) {}

  async execute(
    input: PlaceOrderInput,
  ): Promise<PlaceOrderOutput> {
    // 注文IDを生成
    const orderId = randomUUID();

    // ドメインモデルを生成
    const order = Order.create(orderId, input.items);

    // 注文を保存
    await this.orderRepository.save(order);

    return {
      orderId: order.id,
      totalPrice: order.getTotalPrice(),
      status: order.status,
    };
  }
}

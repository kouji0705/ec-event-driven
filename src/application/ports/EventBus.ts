import type { OrderPlaced } from
  "../../domain/order/events/OrderPlaced";

export type OrderPlacedHandler = (
  event: OrderPlaced,
) => Promise<void>;

export interface EventBus {
  // イベントを購読する
  subscribe(
    type: OrderPlaced["type"],
    handler: OrderPlacedHandler,
  ): void;

  // イベントを発行する
  publish(event: OrderPlaced): Promise<void>;
}

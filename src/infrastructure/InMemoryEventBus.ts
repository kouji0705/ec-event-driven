import type {
    EventBus,
    OrderPlacedHandler,
  } from "../application/ports/EventBus";
  
  import type { OrderPlaced } from
    "../domain/order/events/OrderPlaced";
  
  export class InMemoryEventBus implements EventBus {
    private readonly handlers = new Map<
      OrderPlaced["type"],
      OrderPlacedHandler[]
    >();
  
    // Subscriberを登録
    subscribe(
      type: OrderPlaced["type"],
      handler: OrderPlacedHandler,
    ): void {
      const handlers = this.handlers.get(type) ?? [];
  
      handlers.push(handler);
  
      this.handlers.set(type, handlers);
    }
  
    // イベントを発行
    async publish(event: OrderPlaced): Promise<void> {
      const handlers = this.handlers.get(event.type) ?? [];
  
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          // 1つのHandlerが失敗しても続行
          console.error(
            `[EventBus] ${event.type} の処理に失敗:`,
            error,
          );
        }
      }
    }
  }

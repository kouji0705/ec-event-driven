import type { Order } from "../domain/order/Order";
import type { AnalyticsService } from "../application/ports/AnalyticsService";

export class ConsoleAnalyticsService implements AnalyticsService {
  async record(order: Order): Promise<void> {
    console.log(
      `[Analytics] 売上記録: ${order.getTotalPrice()}円`,
    );
  }
}

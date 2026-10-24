import type { Order } from "../domain/order/Order";
import type { NotificationService } from "../application/ports/NotificationService";

export class ConsoleNotificationService implements NotificationService {
  async notify(order: Order): Promise<void> {
    console.log(
      `[Notification] 管理者に注文通知: ${order.id}`,
    );
  }
}

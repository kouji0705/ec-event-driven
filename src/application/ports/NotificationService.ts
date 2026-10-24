import type { Order } from "../../domain/order/Order";

export interface NotificationService {
  notify(order: Order): Promise<void>;
}

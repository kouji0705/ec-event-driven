import type { Order } from "../../domain/order/Order";

export interface AnalyticsService {
  record(order: Order): Promise<void>;
}

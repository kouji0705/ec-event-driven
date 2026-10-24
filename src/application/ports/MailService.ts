import type { Order } from "../../domain/order/Order";

export interface MailService {
  send(order: Order): Promise<void>;
}

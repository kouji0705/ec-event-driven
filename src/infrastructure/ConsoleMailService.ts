import type { Order } from "../domain/order/Order";
import type { MailService } from "../application/ports/MailService";

export class ConsoleMailService implements MailService {
  constructor(
    private shouldFail = false,
  ) {}

  // 失敗状態を切り替える
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  async send(order: Order): Promise<void> {
    if (this.shouldFail) {
      throw new Error("メール送信に失敗しました");
    }

    console.log(`[Mail] 注文完了メール送信: ${order.id}`);
  }
}

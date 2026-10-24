import type { OrderRepository } from "../domain/order/OrderRepository";
import type { MailService } from "./ports/MailService";
import type { FailedMailRepository } from "./ports/FailedMailRepository";

export type RetryResult = {
  attempted: number;
  succeeded: number;
  failed: number;
};

export class RetryFailedMailsUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly mailService: MailService,
    private readonly failedMailRepository: FailedMailRepository,
  ) {}

  async execute(): Promise<RetryResult> {
    // 失敗した注文IDを取得
    const failedOrderIds =
      await this.failedMailRepository.findAll();

    let succeeded = 0;
    let failed = 0;

    for (const orderId of failedOrderIds) {
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        console.error(`[Retry] 注文が見つかりません: ${orderId}`);
        failed++;
        continue;
      }

      try {
        // メールだけを再送する
        await this.mailService.send(order);

        // 成功したので失敗記録から削除
        await this.failedMailRepository.remove(orderId);

        succeeded++;
      } catch (error) {
        // 失敗記録は残しておく
        console.error(`[Retry] 再送失敗: ${orderId}`, error);
        failed++;
      }
    }

    return {
      attempted: failedOrderIds.length,
      succeeded,
      failed,
    };
  }
}

import { PlaceOrderUseCase } from "./application/PlaceOrderUseCase";
import { InMemoryOrderRepository } from "./infrastructure/InMemoryOrderRepository";

import { ConsoleMailService } from "./infrastructure/ConsoleMailService";
import { ConsoleAnalyticsService } from "./infrastructure/ConsoleAnalyticsService";
import { ConsoleNotificationService } from "./infrastructure/ConsoleNotificationService";

async function main() {
  // メール送信の失敗を再現するかどうか
  const shouldFailMail = process.argv.includes("--fail-mail");

  // Repository
  const orderRepository = new InMemoryOrderRepository();

  // Services
  const mailService = new ConsoleMailService(shouldFailMail);
  const analyticsService = new ConsoleAnalyticsService();
  const notificationService = new ConsoleNotificationService();

  // UseCase
  const placeOrderUseCase = new PlaceOrderUseCase(
    orderRepository,
    mailService,
    analyticsService,
    notificationService,
  );

  // 注文処理を実行
  try {
    const result = await placeOrderUseCase.execute({
      items: [
        {
          productId: "P001",
          productName: "キーボード",
          unitPrice: 8000,
          quantity: 1,
        },
        {
          productId: "P002",
          productName: "マウス",
          unitPrice: 3000,
          quantity: 2,
        },
      ],
    });

    console.log("注文処理完了");
    console.log("注文ID:", result.orderId);
    console.log("合計金額:", result.totalPrice);
    console.log("ステータス:", result.status);

    const savedOrder = await orderRepository.findById(result.orderId);
    console.log("保存された注文:", savedOrder?.getItems());
  } catch (error) {
    console.error("注文処理エラー:", error);
  }
}

main().catch(console.error);

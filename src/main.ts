import { PlaceOrderUseCase } from "./application/PlaceOrderUseCase";
import { RetryFailedMailsUseCase } from "./application/RetryFailedMailsUseCase";

import { OrderPlacedMailHandler } from "./application/handlers/OrderPlacedMailHandler";
import { OrderPlacedAnalyticsHandler } from "./application/handlers/OrderPlacedAnalyticsHandler";
import { OrderPlacedNotificationHandler } from "./application/handlers/OrderPlacedNotificationHandler";

import { InMemoryEventBus } from "./infrastructure/InMemoryEventBus";
import { InMemoryOrderRepository } from "./infrastructure/InMemoryOrderRepository";
import { InMemoryFailedMailRepository } from "./infrastructure/InMemoryFailedMailRepository";

import { ConsoleMailService } from "./infrastructure/ConsoleMailService";
import { ConsoleAnalyticsService } from "./infrastructure/ConsoleAnalyticsService";
import { ConsoleNotificationService } from "./infrastructure/ConsoleNotificationService";

async function main() {
  const shouldFailMail = process.argv.includes("--fail-mail");

  // Repository
  const orderRepository = new InMemoryOrderRepository();
  const failedMailRepository = new InMemoryFailedMailRepository();

  // Service
  const mailService = new ConsoleMailService(shouldFailMail);
  const analyticsService = new ConsoleAnalyticsService();
  const notificationService = new ConsoleNotificationService();

  // EventBus
  const eventBus = new InMemoryEventBus();

  // EventHandler
  const mailHandler = new OrderPlacedMailHandler(
    orderRepository,
    mailService,
    failedMailRepository,
  );

  const analyticsHandler = new OrderPlacedAnalyticsHandler(
    orderRepository,
    analyticsService,
  );

  const notificationHandler = new OrderPlacedNotificationHandler(
    orderRepository,
    notificationService,
  );

  // Subscriberの登録
  eventBus.subscribe(
    "OrderPlaced",
    (event) => mailHandler.handle(event),
  );

  eventBus.subscribe(
    "OrderPlaced",
    (event) => analyticsHandler.handle(event),
  );

  eventBus.subscribe(
    "OrderPlaced",
    (event) => notificationHandler.handle(event),
  );

  // 注文UseCase
  const placeOrderUseCase = new PlaceOrderUseCase(
    orderRepository,
    eventBus,
  );

  // メール再送UseCase（Step 03のまま）
  const retryFailedMailsUseCase = new RetryFailedMailsUseCase(
    orderRepository,
    mailService,
    failedMailRepository,
  );

  // 注文を実行
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

  console.log("\n--- 注文結果 ---");
  console.log("注文ID:", result.orderId);
  console.log("合計金額:", result.totalPrice);
  console.log("ステータス:", result.status);

  console.log(
    "再送待ち:",
    await failedMailRepository.findAll(),
  );

  // Step 03のメール再送機能
  if (shouldFailMail) {
    console.log("\n--- メール送信を復旧 ---");

    mailService.setShouldFail(false);

    console.log("\n--- メール再送 ---");

    const retryResult = await retryFailedMailsUseCase.execute();

    console.log("再送対象:", retryResult.attempted);
    console.log("再送成功:", retryResult.succeeded);
    console.log("再送失敗:", retryResult.failed);

    console.log(
      "再送待ち:",
      await failedMailRepository.findAll(),
    );
  }
}

main().catch((error) => {
  console.error("処理エラー:", error);
  process.exitCode = 1;
});
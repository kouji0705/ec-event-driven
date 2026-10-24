import { PlaceOrderUseCase } from "./application/PlaceOrderUseCase";
import { RetryFailedMailsUseCase } from "./application/RetryFailedMailsUseCase";

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

  // 注文UseCase
  const placeOrderUseCase = new PlaceOrderUseCase(
    orderRepository,
    mailService,
    analyticsService,
    notificationService,
    failedMailRepository,
  );

  // メール再送UseCase
  const retryFailedMailsUseCase = new RetryFailedMailsUseCase(
    orderRepository,
    mailService,
    failedMailRepository,
  );

  // 注文実行
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
  console.log("メール送信:", result.mailStatus);

  console.log(
    "再送待ち:",
    await failedMailRepository.findAll(),
  );

  // メール送信に失敗した場合だけ再実行
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
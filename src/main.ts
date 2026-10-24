import { PlaceOrderUseCase } from "./application/PlaceOrderUseCase";
import { InMemoryOrderRepository } from "./infrastructure/InMemoryOrderRepository";

async function main() {
  // Repositoryを生成
  const orderRepository = new InMemoryOrderRepository();

  // UseCaseを生成
  const placeOrderUseCase = new PlaceOrderUseCase(orderRepository);

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

  console.log("注文完了");
  console.log("注文ID:", result.orderId);
  console.log("合計金額:", result.totalPrice);
  console.log("ステータス:", result.status);

  // 保存した注文を確認
  const savedOrder = await orderRepository.findById(result.orderId);

  console.log("保存された注文:", savedOrder?.getItems());
}

main().catch(console.error);

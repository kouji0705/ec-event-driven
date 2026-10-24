export type OrderItem = {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  };

  export type OrderStatus = "PLACED";

  export class Order {
    private constructor(
      public readonly id: string,
      private readonly items: OrderItem[],
      public readonly status: OrderStatus,
    ) {}

    static create(id: string, items: OrderItem[]): Order {
      if (!id.trim()) {
        throw new Error("注文IDは必須です");
      }

      if (items.length === 0) {
        throw new Error("商品が1つ以上必要です");
      }

      for (const item of items) {
        if (!item.productId.trim() || !item.productName.trim()) {
          throw new Error("商品IDと商品名は必須です");
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new Error("数量は1以上の整数が必要です");
        }

        if (!Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0) {
          throw new Error("単価は0以上の整数が必要です");
        }
      }
      // 呼び出し元からの変更を防ぐためコピー
      const copiedItems = items.map((item) => ({ ...item }));

      return new Order(id, copiedItems, "PLACED");
    }

    getItems(): OrderItem[] {
      return this.items.map ((item) => ({ ...item }));
    }

    getTotalPrice(): number {
      return this.items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0,
      );
    }
  }
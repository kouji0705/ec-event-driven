export type OrderPlaced = Readonly<{
    type: "OrderPlaced";
    orderId: string;
    totalAmount: number;
  }>;

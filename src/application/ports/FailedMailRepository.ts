export interface FailedMailRepository {
    // 失敗した注文IDを保存
    save(orderId: string): Promise<void>;
  
    // 失敗した注文IDの一覧を取得
    findAll(): Promise<string[]>;
  
    // 再送成功時に削除
    remove(orderId: string): Promise<void>;
}

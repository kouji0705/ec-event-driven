import type { FailedMailRepository } from
  "../application/ports/FailedMailRepository";

export class InMemoryFailedMailRepository
  implements FailedMailRepository {

  private readonly failedOrderIds = new Set<string>();

  async save(orderId: string): Promise<void> {
    this.failedOrderIds.add(orderId);
  }

  async findAll(): Promise<string[]> {
    return [...this.failedOrderIds];
  }

  async remove(orderId: string): Promise<void> {
    this.failedOrderIds.delete(orderId);
  }
}

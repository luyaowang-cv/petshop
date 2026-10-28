import { FinanceRecord, FinanceType } from '@app/entities/finance-record';
import { FinanceRecordRepository } from '@app/repositories/finance-record-repository';
import { GetRevenueStatisticsService } from './get-revenue-statistics-service';

class InMemoryFinanceRecordRepository extends FinanceRecordRepository {
  public records: FinanceRecord[] = [];

  async create(record: FinanceRecord): Promise<FinanceRecord> {
    this.records.push(record);
    return record;
  }
  async findAll() {
    return {
      data: this.records,
      total: this.records.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }
  async findById(id: string): Promise<FinanceRecord | null> {
    return this.records.find((r) => r.id === id) ?? null;
  }
  async update(record: FinanceRecord): Promise<FinanceRecord> {
    return record;
  }
  async delete(id: string): Promise<void> {
    this.records = this.records.filter((r) => r.id !== id);
  }
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    type?: FinanceType,
    category?: string,
  ): Promise<FinanceRecord[]> {
    return this.records.filter((r) => {
      const d = r.date;
      const inRange = d >= startDate && d <= endDate;
      const typeOk = !type || r.type === type;
      const categoryOk = !category || r.category === category;
      return inRange && typeOk && categoryOk;
    });
  }
}

function makeRecord(
  category: string,
  amount: number,
  date: Date,
  type: FinanceType = FinanceType.INCOME,
): FinanceRecord {
  return new FinanceRecord({ type, category, amount, date });
}

describe('GetRevenueStatisticsService', () => {
  let repository: InMemoryFinanceRecordRepository;
  let service: GetRevenueStatisticsService;

  const startDate = new Date(2026, 9, 28, 0, 0, 0); // 2026-10-28 00:00:00
  const endDate = new Date(2026, 9, 28, 23, 59, 59);

  beforeEach(() => {
    repository = new InMemoryFinanceRecordRepository();
    service = new GetRevenueStatisticsService(repository);
  });

  it('完成医疗服务按完成日期计入服务收入', async () => {
    await repository.create(
      makeRecord('服务收入', 30000, new Date(2026, 9, 28, 10, 0, 0)),
    );

    const result = await service.execute({ startDate, endDate });

    expect(result.serviceRevenue).toBe(300);
    expect(result.totalRevenue).toBe(300);
    expect(result.serviceOrders).toBe(1);
  });

  it('商品销售计入商品收入', async () => {
    await repository.create(
      makeRecord('商品销售', 5000, new Date(2026, 9, 28, 15, 0, 0)),
    );

    const result = await service.execute({ startDate, endDate });

    expect(result.productRevenue).toBe(50);
    expect(result.productOrders).toBe(1);
  });

  it('忽略支出记录', async () => {
    await repository.create(
      makeRecord('服务收入', 30000, new Date(2026, 9, 28, 10, 0, 0)),
    );
    await repository.create(
      makeRecord('进货', 10000, new Date(2026, 9, 28, 11, 0, 0), FinanceType.EXPENSE),
    );

    const result = await service.execute({ startDate, endDate });

    expect(result.totalRevenue).toBe(300);
    expect(result.totalOrders).toBe(1);
  });

  it('范围外的记录不计入', async () => {
    await repository.create(
      makeRecord('服务收入', 30000, new Date(2026, 9, 27, 10, 0, 0)),
    );

    const result = await service.execute({ startDate, endDate });

    expect(result.serviceRevenue).toBe(0);
    expect(result.totalRevenue).toBe(0);
  });
});

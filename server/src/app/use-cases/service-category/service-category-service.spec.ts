import { ServiceCategory } from '@app/entities/service-category';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { BadRequest } from '../errors/bad-request';
import { EntityNotFound } from '../errors/entity-not-found';
import { CreateServiceCategory } from './create-service-category';
import { EditServiceCategory } from './edit-service-category';
import { DeleteServiceCategory } from './delete-service-category';
import { ListServiceCategories } from './list-service-categories';

class InMemoryServiceCategoryRepository extends ServiceCategoryRepository {
  public categories: ServiceCategory[] = [];
  public serviceCount = 0;

  async create(c: ServiceCategory): Promise<void> {
    this.categories.push(c);
  }
  async save(c: ServiceCategory): Promise<void> {
    const i = this.categories.findIndex((x) => x.id === c.id);
    if (i >= 0) this.categories[i] = c;
  }
  async findById(id: string): Promise<ServiceCategory | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }
  async findByName(name: string): Promise<ServiceCategory | null> {
    return this.categories.find((c) => c.name === name) ?? null;
  }
  async findMany(): Promise<ServiceCategory[]> {
    return this.categories;
  }
  async deleteById(id: string): Promise<void> {
    this.categories = this.categories.filter((c) => c.id !== id);
  }
  async countServices(): Promise<number> {
    return this.serviceCount;
  }
}

describe('ServiceCategory 用例', () => {
  let repository: InMemoryServiceCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryServiceCategoryRepository();
  });

  it('可以新建「美容」这样的分类', async () => {
    const service = new CreateServiceCategory(repository);

    const { category } = await service.execute({ name: '美容', icon: '✨' });

    expect(category.name).toBe('美容');
    expect(category.icon).toBe('✨');
    expect(repository.categories).toHaveLength(1);
  });

  it('分类名重复时抛 BadRequest', async () => {
    await repository.create(new ServiceCategory({ name: '洗护' }));
    const service = new CreateServiceCategory(repository);

    await expect(service.execute({ name: '洗护' })).rejects.toBeInstanceOf(
      BadRequest,
    );
  });

  it('分类名为空时抛 BadRequest', async () => {
    const service = new CreateServiceCategory(repository);

    await expect(service.execute({ name: '  ' })).rejects.toBeInstanceOf(
      BadRequest,
    );
  });

  it('可重命名分类', async () => {
    const existing = new ServiceCategory({ name: '洗护' });
    await repository.create(existing);
    const service = new EditServiceCategory(repository);

    const { category } = await service.execute({
      id: existing.id,
      name: '洗护美容',
    });

    expect(category.name).toBe('洗护美容');
  });

  it('重命名成已有名称时抛 BadRequest', async () => {
    await repository.create(new ServiceCategory({ name: '洗护' }));
    const other = new ServiceCategory({ name: '医疗' });
    await repository.create(other);

    const service = new EditServiceCategory(repository);

    await expect(
      service.execute({ id: other.id, name: '洗护' }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('分类下还有项目时禁止删除', async () => {
    const existing = new ServiceCategory({ name: '洗护' });
    await repository.create(existing);
    repository.serviceCount = 3;

    const service = new DeleteServiceCategory(repository);

    await expect(service.execute(existing.id)).rejects.toBeInstanceOf(
      BadRequest,
    );
    expect(repository.categories).toHaveLength(1);
  });

  it('空分类可以删除', async () => {
    const existing = new ServiceCategory({ name: '美容' });
    await repository.create(existing);
    repository.serviceCount = 0;

    const service = new DeleteServiceCategory(repository);
    await service.execute(existing.id);

    expect(repository.categories).toHaveLength(0);
  });

  it('删除不存在的分类抛 EntityNotFound', async () => {
    const service = new DeleteServiceCategory(repository);

    await expect(service.execute('missing')).rejects.toBeInstanceOf(
      EntityNotFound,
    );
  });

  it('列出全部分类', async () => {
    await repository.create(new ServiceCategory({ name: '洗护', sortOrder: 1 }));
    await repository.create(new ServiceCategory({ name: '医疗', sortOrder: 2 }));

    const service = new ListServiceCategories(repository);
    const { categories } = await service.execute();

    expect(categories).toHaveLength(2);
  });
});

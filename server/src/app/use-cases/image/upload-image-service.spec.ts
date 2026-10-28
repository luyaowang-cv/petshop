import { ImageStorage } from '@app/providers/image-storage';
import { BadRequest } from '../errors/bad-request';
import { UploadImageService } from './upload-image-service';

class FakeImageStorage extends ImageStorage {
  public saved: unknown[] = [];
  async save(params: {
    buffer: Buffer;
    originalName: string;
    mimetype: string;
  }): Promise<string> {
    this.saved.push(params);
    return '/uploads/test.png';
  }
}

describe('UploadImageService', () => {
  let storage: FakeImageStorage;
  let service: UploadImageService;

  beforeEach(() => {
    storage = new FakeImageStorage();
    service = new UploadImageService(storage);
  });

  it('合法图片 → 返回 URL', async () => {
    const { url } = await service.execute({
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      originalName: 'dog.png',
      mimetype: 'image/png',
      size: 1024,
    });

    expect(url).toBe('/uploads/test.png');
    expect(storage.saved).toHaveLength(1);
  });

  it('非法类型 → BadRequest', async () => {
    await expect(
      service.execute({
        buffer: Buffer.from([]),
        originalName: 'a.gif',
        mimetype: 'image/gif',
        size: 1024,
      }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('超过 5MB → BadRequest', async () => {
    await expect(
      service.execute({
        buffer: Buffer.from([]),
        originalName: 'big.png',
        mimetype: 'image/png',
        size: 5 * 1024 * 1024 + 1,
      }),
    ).rejects.toBeInstanceOf(BadRequest);
  });
});

import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { LocalImageStorage } from './local-image-storage';
import { validateImage } from '../../app/providers/image-storage';

describe('LocalImageStorage', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'img-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('保存 PNG 图片返回 URL 并写入文件', async () => {
    const storage = new LocalImageStorage(dir);
    const url = await storage.save({
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      originalName: 'dog.png',
      mimetype: 'image/png',
    });

    expect(url).toMatch(/^\/uploads\/.+\.png$/);

    const filename = url.replace('/uploads/', '');
    await expect(readFile(join(dir, filename))).resolves.toBeDefined();
  });

  it('无扩展名时从 mimetype 推断扩展名', async () => {
    const storage = new LocalImageStorage(dir);
    const url = await storage.save({
      buffer: Buffer.from([0xff, 0xd8, 0xff]),
      originalName: 'image',
      mimetype: 'image/jpeg',
    });

    expect(url).toMatch(/\.jpg$/);
  });
});

describe('validateImage', () => {
  it('合法类型和大小通过', () => {
    expect(validateImage('image/png', 1024).valid).toBe(true);
  });

  it('非法类型被拒', () => {
    const result = validateImage('image/gif', 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('超过 5MB 被拒', () => {
    const result = validateImage('image/png', 5 * 1024 * 1024 + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

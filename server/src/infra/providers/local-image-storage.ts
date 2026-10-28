import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import {
  ImageStorage,
  SaveImageParams,
} from '../../app/providers/image-storage';

@Injectable()
export class LocalImageStorage extends ImageStorage {
  constructor(private readonly uploadDir: string) {
    super();
  }

  async save(params: SaveImageParams): Promise<string> {
    const ext = this.extractExtension(params.originalName, params.mimetype);
    const filename = `${randomUUID()}${ext}`;
    const filePath = join(this.uploadDir, filename);

    await mkdir(this.uploadDir, { recursive: true });
    await writeFile(filePath, params.buffer);

    return `/uploads/${filename}`;
  }

  private extractExtension(originalName: string, mimetype: string): string {
    const nameExt = extname(originalName).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];

    if (allowed.includes(nameExt)) {
      return nameExt === '.jpeg' ? '.jpg' : nameExt;
    }

    return this.extensionFromMimetype(mimetype);
  }

  private extensionFromMimetype(mimetype: string): string {
    switch (mimetype) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return '.jpg';
    }
  }
}

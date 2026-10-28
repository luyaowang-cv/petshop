import { Injectable } from '@nestjs/common';
import { ImageStorage, validateImage } from '@app/providers/image-storage';
import { BadRequest } from '../errors/bad-request';

interface UploadImageRequest {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class UploadImageService {
  constructor(private imageStorage: ImageStorage) {}

  async execute(request: UploadImageRequest) {
    const result = validateImage(request.mimetype, request.size);
    if (!result.valid) {
      throw new BadRequest(result.error!);
    }

    const url = await this.imageStorage.save({
      buffer: request.buffer,
      originalName: request.originalName,
      mimetype: request.mimetype,
    });

    return { url };
  }
}

import { Module } from '@nestjs/common';
import { UploadImageService } from '@app/use-cases/image/upload-image-service';
import { ImageStorage } from '@app/providers/image-storage';
import { LocalImageStorage } from '@infra/providers/local-image-storage';
import { join } from 'path';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [
    UploadImageService,
    {
      provide: ImageStorage,
      // 本地磁盘存储；后续可无缝替换为 OSS/COS 实现
      useFactory: () => new LocalImageStorage(join(process.cwd(), 'uploads')),
    },
  ],
})
export class UploadModule {}

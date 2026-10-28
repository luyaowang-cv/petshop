import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageService } from '@app/use-cases/image/upload-image-service';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

// 工作台（admin）图片上传：由全局 admin JWT 守卫保护，无需 @PublicRoute
@Controller('uploads')
export class UploadController {
  constructor(private uploadImageService: UploadImageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: UploadedFile) {
    if (!file) {
      throw new BadRequestException('请选择图片文件');
    }

    const { url } = await this.uploadImageService.execute({
      buffer: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return { url };
  }
}

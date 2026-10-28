import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerJwtAuthGuard } from '@infra/auth/customer-jwt-auth.guard';
import { UploadImageService } from '@app/use-cases/image/upload-image-service';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@PublicRoute() // 跳过全局 admin JWT 守卫，改用下方顾客守卫
@UseGuards(CustomerJwtAuthGuard)
@Controller('miniprogram/upload')
export class MiniprogramUploadController {
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

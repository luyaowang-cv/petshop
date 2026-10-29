import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { CustomerAuthModule } from '@infra/auth/customer-auth.module';
import { WechatApiClient } from '@app/providers/wechat-api-client';
import { HttpWechatApiClient } from '@infra/providers/wechat-api-client';
import { MockWechatApiClient } from '@infra/providers/mock-wechat-api-client';
import { AuthenticateCustomerService } from '@app/use-cases/customer/authenticate-customer-service';
import { AddPetService } from '@app/use-cases/pets/add-pet-service';
import { ListCustomerPetsService } from '@app/use-cases/pets/list-customer-pets-service';
import { EditMyPetService } from '@app/use-cases/pets/edit-my-pet-service';
import { DeleteMyPetService } from '@app/use-cases/pets/delete-my-pet-service';
import { ListActivePetshopServices } from '@app/use-cases/petshop-service/list-active-petshop-services';
import { ScheduleMyAppointmentService } from '@app/use-cases/appointment/schedule-my-appointment-service';
import { ListMyAppointmentsService } from '@app/use-cases/appointment/list-my-appointments-service';
import { CancelMyAppointmentService } from '@app/use-cases/appointment/cancel-my-appointment-service';
import { GetAppointmentAvailabilityService } from '@app/use-cases/appointment/get-appointment-availability-service';
import { GetMyMemberInfoService } from '@app/use-cases/customer/get-my-member-info-service';
import { UpdateMyProfileService } from '@app/use-cases/customer/update-my-profile-service';
import { UploadImageService } from '@app/use-cases/image/upload-image-service';
import { ImageStorage } from '@app/providers/image-storage';
import { LocalImageStorage } from '@infra/providers/local-image-storage';
import { join } from 'path';
import { MiniprogramAuthController } from './miniprogram-auth.controller';
import { MiniprogramPetController } from './miniprogram-pet.controller';
import { MiniprogramServiceController } from './miniprogram-service.controller';
import { MiniprogramAppointmentController } from './miniprogram-appointment.controller';
import { MiniprogramMeController } from './miniprogram-me.controller';
import { MiniprogramRecordsController } from './miniprogram-records.controller';
import { MiniprogramUploadController } from './miniprogram-upload.controller';
import { GetCustomerConsumptionRecordsService } from '@app/use-cases/customer/get-customer-consumption-records-service';
import { ListPointsRecordsService } from '@app/use-cases/member/list-points-records-service';

@Module({
  imports: [DatabaseModule, CustomerAuthModule],
  controllers: [
    MiniprogramAuthController,
    MiniprogramPetController,
    MiniprogramServiceController,
    MiniprogramAppointmentController,
    MiniprogramMeController,
    MiniprogramRecordsController,
    MiniprogramUploadController,
  ],
  providers: [
    AuthenticateCustomerService,
    AddPetService,
    ListCustomerPetsService,
    EditMyPetService,
    DeleteMyPetService,
    ListActivePetshopServices,
    ScheduleMyAppointmentService,
    ListMyAppointmentsService,
    CancelMyAppointmentService,
    GetAppointmentAvailabilityService,
    GetMyMemberInfoService,
    UpdateMyProfileService,
    GetCustomerConsumptionRecordsService,
    ListPointsRecordsService,
    UploadImageService,
    {
      provide: ImageStorage,
      // 本地磁盘存储；后续可无缝替换为 OSS/COS 实现
      useFactory: () => new LocalImageStorage(join(process.cwd(), 'uploads')),
    },
    {
      provide: WechatApiClient,
      // 未配置 AppID/Secret 时走 Mock，便于本地开发；接入真实小程序后自动切换为 HTTP 客户端
      useFactory: () => {
        const appId = process.env.WECHAT_APP_ID;
        const appSecret = process.env.WECHAT_APP_SECRET;
        if (appId && appSecret) {
          return new HttpWechatApiClient(appId, appSecret);
        }
        return new MockWechatApiClient();
      },
    },
  ],
})
export class MiniprogramModule {}

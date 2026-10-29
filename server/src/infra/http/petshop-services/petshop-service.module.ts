import { Module } from "@nestjs/common";
import { CreatePetshopService } from "@app/use-cases/petshop-service/create-petshop-service";
import { ListPetshopServices } from "@app/use-cases/petshop-service/list-petshop-services";
import { ShowPetshopService } from "@app/use-cases/petshop-service/show-petshop-service";
import { DatabaseModule } from "@infra/database/database.module";
import { PetshopServicesController } from "./petshop-services.controller";
import { ServiceCategoriesController } from "./service-categories.controller";
import { EditPetshopService } from "@app/use-cases/petshop-service/edit-petshop-service";
import { DeletePetshopService } from "@app/use-cases/petshop-service/delete-petshop-service";
import { CreateServiceCategory } from "@app/use-cases/service-category/create-service-category";
import { ListServiceCategories } from "@app/use-cases/service-category/list-service-categories";
import { EditServiceCategory } from "@app/use-cases/service-category/edit-service-category";
import { DeleteServiceCategory } from "@app/use-cases/service-category/delete-service-category";

@Module({
  imports: [DatabaseModule],
  controllers: [PetshopServicesController, ServiceCategoriesController],
  providers: [
    CreatePetshopService,
    ListPetshopServices,
    ShowPetshopService,
    EditPetshopService,
    DeletePetshopService,
    CreateServiceCategory,
    ListServiceCategories,
    EditServiceCategory,
    DeleteServiceCategory,
  ],
})
export class PetshopServiceModule { }

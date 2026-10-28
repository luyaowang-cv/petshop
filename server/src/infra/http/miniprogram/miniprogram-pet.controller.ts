import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerJwtAuthGuard } from '@infra/auth/customer-jwt-auth.guard';
import { CurrentCustomer } from '@infra/auth/decorators/current-customer-decorator';
import { CustomerAuthContext } from '@infra/auth/customer-jwt.strategy';
import { AddPetService } from '@app/use-cases/pets/add-pet-service';
import { ListCustomerPetsService } from '@app/use-cases/pets/list-customer-pets-service';
import { EditMyPetService } from '@app/use-cases/pets/edit-my-pet-service';
import { DeleteMyPetService } from '@app/use-cases/pets/delete-my-pet-service';
import { PetViewModel } from '../view-models/pet-view-model';
import { CreateMyPetBody, UpdateMyPetBody } from './dtos/pet-body';

@PublicRoute() // 跳过全局 admin JWT 守卫，改用下方顾客守卫
@UseGuards(CustomerJwtAuthGuard)
@Controller('miniprogram/pets')
export class MiniprogramPetController {
  constructor(
    private addPetService: AddPetService,
    private listCustomerPetsService: ListCustomerPetsService,
    private editMyPetService: EditMyPetService,
    private deleteMyPetService: DeleteMyPetService,
  ) {}

  @Get()
  async list(@CurrentCustomer() customer: CustomerAuthContext) {
    const { pets } = await this.listCustomerPetsService.execute(
      customer.customerId,
    );
    return { pets: pets.map(PetViewModel.toHTTP) };
  }

  @Post()
  async create(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Body() body: CreateMyPetBody,
  ) {
    const { pet } = await this.addPetService.execute({
      ...body,
      ownerId: customer.customerId,
    });
    return { pet: PetViewModel.toHTTP(pet) };
  }

  @Put('/:id')
  async update(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Param('id') id: string,
    @Body() body: UpdateMyPetBody,
  ) {
    const { pet } = await this.editMyPetService.execute({
      customerId: customer.customerId,
      petId: id,
      body,
    });
    return { pet: PetViewModel.toHTTP(pet) };
  }

  @Delete('/:id')
  async destroy(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Param('id') id: string,
  ) {
    await this.deleteMyPetService.execute({
      customerId: customer.customerId,
      petId: id,
    });
  }
}

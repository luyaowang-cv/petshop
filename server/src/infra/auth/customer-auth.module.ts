import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants, CUSTOMER_JWT_SERVICE } from './constants';
import { CustomerJwtStrategy } from './customer-jwt.strategy';
import { CustomerJwtAuthGuard } from './customer-jwt-auth.guard';
import { CustomerJwtEncrypter } from './customer-jwt-encrypter';

@Module({
  imports: [PassportModule],
  providers: [
    {
      provide: CUSTOMER_JWT_SERVICE,
      useFactory: () =>
        new JwtService({
          secret: jwtConstants.customerJwtSecret,
          signOptions: { algorithm: 'HS256' },
        }),
    },
    CustomerJwtStrategy,
    CustomerJwtAuthGuard,
    CustomerJwtEncrypter,
  ],
  exports: [CustomerJwtEncrypter, CustomerJwtAuthGuard],
})
export class CustomerAuthModule {}

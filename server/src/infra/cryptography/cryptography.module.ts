import { HashComparer } from '@app/cryptography/hash-comparer';
import { HashGenerator } from '@app/cryptography/hash-generator';
import { Module } from '@nestjs/common';
import { BcryptHasher } from './bcrypt-hasher';
import { Encrypter } from '@app/cryptography/encrypter';
import { JwtEncrypter } from './jwt-encrypter';
import { AuthModule } from '@infra/auth/auth.module';
import { AesEncrypter } from '@app/cryptography/aes-encrypter';
import { CryptoAesEncrypter } from './crypto-aes-encrypter';

@Module({
  imports: [AuthModule],
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: AesEncrypter, useClass: CryptoAesEncrypter },
  ],
  exports: [Encrypter, HashComparer, HashGenerator, AesEncrypter],
})
export class CryptographyModule {}

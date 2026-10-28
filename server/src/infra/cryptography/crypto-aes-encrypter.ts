import { Injectable } from '@nestjs/common';
import { AesEncrypter } from '@app/cryptography/aes-encrypter';
import * as crypto from 'crypto';

@Injectable()
export class CryptoAesEncrypter implements AesEncrypter {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16;

  constructor() {
    const encryptionKey = process.env.SMS_ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error('SMS_ENCRYPTION_KEY environment variable is not set');
    }

    // Ensure key is 32 bytes for AES-256
    this.key = crypto.createHash('sha256').update(encryptionKey).digest();
  }

  async encrypt(plainText: string): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Prepend IV to encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  async decrypt(encryptedText: string): Promise<string> {
    const parts = encryptedText.split(':');

    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

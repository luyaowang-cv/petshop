export abstract class AesEncrypter {
  abstract encrypt(plainText: string): Promise<string>;
  abstract decrypt(encryptedText: string): Promise<string>;
}

export interface SaveImageParams {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
}

export abstract class ImageStorage {
  abstract save(params: SaveImageParams): Promise<string>;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImage(
  mimetype: string,
  size: number,
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(mimetype as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { valid: false, error: '不支持的图片格式，仅支持 jpg/png/webp' };
  }
  if (size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: '图片大小不能超过 5MB' };
  }
  return { valid: true };
}

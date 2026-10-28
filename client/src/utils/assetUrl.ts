// 将后端返回的相对图片路径（如 /uploads/xxx.jpg）拼成可访问的完整 URL
export function assetUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

import api from "../api";

// 工作台图片上传（multipart/form-data），返回相对 URL（如 /uploads/xxx.jpg）
export async function uploadImage(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ url: string }>("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.url;
}

export enum PetType {
  CAT = "CAT",
  DOG = "DOG",
  OTHER = "OTHER",
}

export enum PetGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  UNKNOWN = "UNKNOWN",
}

export type Pet = {
  id: string;
  name: string;
  breed: string;
  age: number;
  petType: PetType; // 宠物类型
  gender: PetGender; // 性别
  birthday?: string | null; // 生日
  isNeutered: boolean; // 是否绝育
  lastGroomingAt?: string | null; // 最近洗护时间
  // 健康信息
  vaccineInfo?: string | null; // 疫苗情况
  allergyHistory?: string | null; // 过敏史
  healthNotes?: string | null; // 注意事项
  imageUrl?: string | null; // 照片
  ownerId: string;
};

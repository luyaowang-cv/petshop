// 后端接口地址
// 本地开发：http://localhost:3333（微信开发者工具需勾选「不校验合法域名」）
// 真机/部署（阶段 A）：https://pet-api.offerscoming.cn
export const API_BASE_URL = 'https://pet-api.offerscoming.cn'

// 门店信息（暂无后端接口，先由前端维护；后台「门店信息」页接入接口后可改为读取）
export const STORE_INFO = {
  name: '爱尚宠物店',
  phone: '13888888888',
  phoneDisplay: '138-8888-8888',
  address: '河北省邯郸市魏县',
  businessHours: '周一至周日 09:00-21:00',
}

// 将后端返回的图片路径（相对路径 /uploads/x 或完整 URL）转换为可访问的完整地址
export function assetUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${API_BASE_URL}${path}`
}

// 状态与枚举的中文展示文案
export const PET_TYPE_LABEL: Record<string, string> = {
  CAT: '猫',
  DOG: '狗',
  OTHER: '其他',
}

export const PET_GENDER_LABEL: Record<string, string> = {
  MALE: '公',
  FEMALE: '母',
  UNKNOWN: '未知',
}

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待审核',
  CONFIRMED: '已确认',
  REJECTED: '已拒绝',
  CANCELED: '已取消',
  COMPLETED: '已完成',
  DONE: '已完成',
  PENDING_PAYMENT: '待支付',
}

export const SERVICE_CATEGORY_LABEL: Record<string, string> = {
  GROOMING: '洗护',
  MEDICAL: '医疗',
  BOARDING: '寄养',
}

export const SERVICE_CATEGORY_EMOJI: Record<string, string> = {
  GROOMING: '🛁',
  MEDICAL: '💊',
  BOARDING: '🏠',
}

export const MEMBER_LEVEL_LABEL: Record<string, string> = {
  REGULAR: '普通会员',
  VIP: 'VIP 会员',
}

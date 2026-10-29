import loginCover from '../assets/login-welcome.jpg'

// 后端接口地址
// 本地开发：http://localhost:3333（微信开发者工具需勾选「不校验合法域名」）
// 真机/部署（阶段 A）：https://pet-api.offerscoming.cn
export const API_BASE_URL = 'https://pet-api.offerscoming.cn'

// 登录页封面。
// 用 import 而不是写死路径：打包后文件名带内容哈希，换图后路径自动变化，
// 不会命中微信开发者工具按路径缓存旧图片的问题。
export const LOGIN_COVER = loginCover

// 登录后各页面统一的背景图（已预先做高斯模糊，运行时无需 CSS filter）
export const PAGE_BG = '/assets/page-bg.jpg'

// 门店信息（暂无后端接口，先由前端维护；后台「门店信息」页接入接口后可改为读取）
export const STORE_INFO = {
  name: '吉宠宠物店',
  phone: '17331326049',
  phoneDisplay: '173-3132-6049',
  address: '魏县天安大道西段与魏都南大街交叉口西南工商银行南20米',
  businessHours: '周一至周日 09:00-20:00',
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

export const MEMBER_LEVEL_LABEL: Record<string, string> = {
  REGULAR: '普通会员',
  VIP: 'VIP 会员',
}

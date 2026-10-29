// 与后端 view-model 对齐的类型定义

export type PetType = 'CAT' | 'DOG' | 'OTHER'
export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN'

export interface Pet {
  id: string
  name: string
  breed: string
  age: number
  petType: PetType
  gender: PetGender
  birthday: string | null
  isNeutered: boolean
  lastGroomingAt: string | null
  vaccineInfo: string | null
  allergyHistory: string | null
  healthNotes: string | null
  imageUrl: string | null
  ownerId: string
}

// 服务分类（工作台可自由新增，如「美容」）
export interface ServiceCategory {
  id: string
  name: string
  icon: string | null
  sortOrder: number
}

export interface PetshopService {
  id: string
  title: string
  description: string
  categoryId: string | null
  category: ServiceCategory | null
  value: number // 单位：分
  duration?: number
  imageUrl: string | null
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELED'
  | 'COMPLETED'
  | 'DONE'
  | 'PENDING_PAYMENT'

export interface Appointment {
  id: string
  appointmentTime: string
  petId: string
  serviceId: string
  status: AppointmentStatus
  rejectReason: string | null
  customerNote: string | null
  pet?: Pet
  service?: PetshopService
}

export interface ConsumptionRecord {
  id: string
  type: 'PRODUCT' | 'SERVICE'
  date: string
  amount: number // 单位：分
  status: string
  items: string[]
  note?: string
}

export type PointsAction = 'ADD' | 'DEDUCT' | 'CONSUME' | 'EXPIRE'

export interface PointsRecord {
  id: string
  action: PointsAction
  points: number
  balance: number
  reason: string
  createdAt: string
}

export type MemberLevel = 'REGULAR' | 'VIP'

export interface Me {
  name: string
  avatarUrl: string | null
  memberLevel: MemberLevel
  memberBalance: number
  memberPoints: number
}

export interface CustomerAuthResult {
  customer: {
    id: string
    name: string
    avatarUrl: string | null
  }
  accessToken: string
  refreshToken: string
  isNewCustomer: boolean
}

export interface PetInput {
  name: string
  breed: string
  age: number
  birthday?: string
  lastGroomingAt?: string
  vaccineInfo?: string
  allergyHistory?: string
  healthNotes?: string
  imageUrl?: string
  petType: PetType
  gender: PetGender
  isNeutered: boolean
}

export interface CreateAppointmentInput {
  petId: string
  serviceId: string
  appointmentTime: string
  customerNote?: string
}

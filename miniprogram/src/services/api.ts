import Taro from '@tarojs/taro'
import { request } from '../utils/request'
import { API_BASE_URL } from '../constants/config'
import { getAccessToken } from '../utils/auth'
import type {
  Appointment,
  CreateAppointmentInput,
  CustomerAuthResult,
  Me,
  Pet,
  PetInput,
  PetshopService,
} from '../types'

export function login(code: string, phoneCode: string) {
  return request<CustomerAuthResult>('/miniprogram/auth', {
    method: 'POST',
    data: { code, phoneCode },
    auth: false,
  })
}

export function getMe() {
  return request<{ me: Me }>('/miniprogram/me')
}

export function listPets() {
  return request<{ pets: Pet[] }>('/miniprogram/pets')
}

export function createPet(data: PetInput) {
  return request<{ pet: Pet }>('/miniprogram/pets', { method: 'POST', data })
}

export function updatePet(id: string, data: PetInput) {
  return request<{ pet: Pet }>(`/miniprogram/pets/${id}`, {
    method: 'PUT',
    data,
  })
}

export function deletePet(id: string) {
  return request<unknown>(`/miniprogram/pets/${id}`, { method: 'DELETE' })
}

export function listServices() {
  return request<{ services: PetshopService[] }>('/miniprogram/services')
}

export function createAppointment(data: CreateAppointmentInput) {
  return request<{ appointment: Appointment }>('/miniprogram/appointments', {
    method: 'POST',
    data,
  })
}

export function listAppointments() {
  return request<{ appointments: Appointment[] }>('/miniprogram/appointments')
}

export function cancelAppointment(id: string) {
  return request<{ appointment: Appointment }>(
    `/miniprogram/appointments/${id}/cancel`,
    { method: 'POST' },
  )
}

// 上传图片（multipart/form-data），返回图片 URL
export async function uploadImage(filePath: string): Promise<string> {
  const token = getAccessToken()
  const res = await Taro.uploadFile({
    url: `${API_BASE_URL}/miniprogram/upload`,
    filePath,
    name: 'file',
    header: { Authorization: `Bearer ${token}` },
  })

  if (res.statusCode < 200 || res.statusCode >= 300) {
    let message = '上传失败'
    try {
      const body = JSON.parse(res.data)
      if (typeof body?.message === 'string') message = body.message
      else if (Array.isArray(body?.message)) message = body.message[0]
    } catch {
      // 忽略解析失败
    }
    throw new Error(message)
  }

  const body = JSON.parse(res.data) as { url: string }
  return body.url
}

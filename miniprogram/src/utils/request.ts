import Taro from '@tarojs/taro'
import { API_BASE_URL } from '../constants/config'
import { clearAuth, getAccessToken, redirectToLogin } from './auth'

export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  // 是否携带登录态；登录接口本身传 false
  auth?: boolean
}

function extractMessage(data: unknown): string {
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>
    if (Array.isArray(body.message)) {
      return (body.message[0] as string) || '请求参数有误'
    }
    if (typeof body.message === 'string' && body.message) {
      return body.message
    }
  }
  return '请求失败'
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', data, auth = true } = options

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (auth) {
    const token = getAccessToken()
    if (token) {
      header.Authorization = `Bearer ${token}`
    }
  }

  let res: Taro.request.SuccessCallbackResult
  try {
    res = await Taro.request({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
      header,
    })
  } catch (e) {
    throw new ApiError(0, '网络异常，请稍后重试')
  }

  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data as T
  }

  if (res.statusCode === 401) {
    // 登录接口自身的 401 是微信凭证/授权无效，不是登录态过期：
    // 既不能清 token，也不能跳转（否则在登录页无限重定向）
    if (!auth) {
      throw new ApiError(401, extractMessage(res.data))
    }

    // 登录态失效：清除本地 token 并跳转登录（登录接口幂等，可静默重新登录）
    clearAuth()
    redirectToLogin()
    throw new ApiError(401, '登录已过期，请重新登录')
  }

  throw new ApiError(res.statusCode, extractMessage(res.data))
}

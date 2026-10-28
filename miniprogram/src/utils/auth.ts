import Taro from '@tarojs/taro'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function setAuth(accessToken: string, refreshToken: string) {
  Taro.setStorageSync(ACCESS_TOKEN_KEY, accessToken)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
}

export function getAccessToken(): string {
  return Taro.getStorageSync(ACCESS_TOKEN_KEY) || ''
}

export function getRefreshToken(): string {
  return Taro.getStorageSync(REFRESH_TOKEN_KEY) || ''
}

export function clearAuth() {
  Taro.removeStorageSync(ACCESS_TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

export function redirectToLogin() {
  Taro.reLaunch({ url: '/pages/login/index' })
}

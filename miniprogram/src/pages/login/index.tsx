import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, View, Text } from '@tarojs/components'
import { login } from '../../services/api'
import { isLoggedIn, setAuth } from '../../utils/auth'
import './index.scss'

export default function Login() {
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    if (isLoggedIn()) {
      Taro.switchTab({ url: '/pages/home/index' })
    }
  })

  const handleGetPhoneNumber = async (e: any) => {
    const phoneCode = e?.detail?.code
    if (!phoneCode) {
      Taro.showToast({ title: '请授权手机号', icon: 'none' })
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const loginResult = await Taro.login()
      const code = loginResult.code
      if (!code) {
        throw new Error('微信登录失败')
      }
      const result = await login(code, phoneCode)
      setAuth(result.accessToken, result.refreshToken)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 500)
    } catch (err) {
      const message = (err as Error)?.message || '登录失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login'>
      <View className='login__brand'>
        <Text className='login__title'>爱尚宠物</Text>
        <Text className='login__subtitle'>宠物洗护 · 预约 · 会员服务</Text>
      </View>
      <View className='login__body'>
        <Button
          className='login__btn'
          openType='getPhoneNumber'
          onGetPhoneNumber={handleGetPhoneNumber}
          loading={loading}
        >
          微信手机号一键登录
        </Button>
        <Text className='login__tip'>登录即代表同意授权手机号用于预约与会员服务</Text>
      </View>
    </View>
  )
}

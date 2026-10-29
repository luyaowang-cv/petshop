import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, View, Text, Image } from '@tarojs/components'
import { login, updateMyProfile, uploadImage } from '../../services/api'
import { LOGIN_COVER } from '../../constants/config'
import { isLoggedIn, setAuth } from '../../utils/auth'
import './index.scss'

export default function Login() {
  const [loading, setLoading] = useState(false)
  // 手机号授权成功后，若还没有头像，再询问是否用微信头像
  const [askAvatar, setAskAvatar] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

  useLoad(() => {
    if (isLoggedIn()) {
      Taro.switchTab({ url: '/pages/home/index' })
    }
  })

  const goHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

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

      // 老用户已有头像就直接进首页；新用户顺势问一句要不要用微信头像
      if (result.customer?.avatarUrl) {
        setTimeout(goHome, 500)
        return
      }
      setAskAvatar(true)
    } catch (err) {
      const message = (err as Error)?.message || '登录失败'
      Taro.showToast({ title: message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleChooseAvatar = async (e: any) => {
    const tempPath = e?.detail?.avatarUrl
    if (!tempPath || savingAvatar) return

    setSavingAvatar(true)
    try {
      const url = await uploadImage(tempPath)
      await updateMyProfile({ avatarUrl: url })
      Taro.showToast({ title: '头像已设置', icon: 'success' })
    } catch (err) {
      // 头像不是关键路径，失败不影响进入首页
      Taro.showToast({ title: '头像设置失败，可稍后在「我的」里修改', icon: 'none' })
    } finally {
      setSavingAvatar(false)
      setTimeout(goHome, 500)
    }
  }

  return (
    <View className='login'>
      <Image className='login__cover' src={LOGIN_COVER} mode='aspectFill' />

      <View className='login__content'>
        {askAvatar ? (
          <View className='login__panel'>
            <View className='login__avatar-tip-icon'>🐾</View>
            <Text className='login__sheet-title'>使用微信头像</Text>
            <Text className='login__sheet-desc'>
              用微信头像作为会员头像，到店时店员更好认
            </Text>

            <Button
              className='login__btn'
              openType='chooseAvatar'
              onChooseAvatar={handleChooseAvatar}
              loading={savingAvatar}
            >
              使用微信头像
            </Button>
            <Text className='login__sheet-skip' onClick={goHome}>
              暂不设置，先去逛逛
            </Text>
          </View>
        ) : (
          <View className='login__panel'>
            <Button
              className='login__btn'
              openType='getPhoneNumber'
              onGetPhoneNumber={handleGetPhoneNumber}
              loading={loading}
            >
              微信手机号一键登录
            </Button>
            <Text className='login__tip'>
              登录即代表同意授权手机号用于预约与会员服务
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

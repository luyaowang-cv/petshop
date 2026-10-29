import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { getMe } from '../../services/api'
import {
  assetUrl,
  MEMBER_LEVEL_LABEL,
  STORE_INFO,
} from '../../constants/config'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { Me } from '../../types'
import './index.scss'

export default function MePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchMe()
  })

  const fetchMe = async () => {
    try {
      const { me } = await getMe()
      setMe(me)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goPets = () => {
    Taro.navigateTo({ url: '/pages/pets/index' })
  }

  const goAppointments = () => {
    Taro.switchTab({ url: '/pages/appointments/index' })
  }

  const goProfileEdit = () => {
    Taro.navigateTo({ url: '/pages/profile-edit/index' })
  }

  const goConsumption = () => {
    Taro.navigateTo({ url: '/pages/consumption-records/index' })
  }

  const goPoints = () => {
    Taro.navigateTo({ url: '/pages/points-records/index' })
  }

  const callStore = () => {
    Taro.makePhoneCall({ phoneNumber: STORE_INFO.phone }).catch(() => {
      Taro.showModal({
        title: '联系门店',
        content: `请拨打 ${STORE_INFO.phoneDisplay}`,
        showCancel: false,
      })
    })
  }

  const menuItems = [
    { icon: '🐶', label: '我的宠物', onClick: goPets },
    { icon: '📅', label: '我的预约', onClick: goAppointments },
    { icon: '🧾', label: '消费记录', onClick: goConsumption },
    { icon: '⭐', label: '积分明细', onClick: goPoints },
    { icon: '📞', label: '联系门店', onClick: callStore },
    { icon: '✏️', label: '编辑资料', onClick: goProfileEdit },
  ]

  return (
    <View className='me'>
      <PageBg />
      <View className='me__hero'>
        <View className='me__user' onClick={goProfileEdit}>
          {me?.avatarUrl ? (
            <Image
              className='me__avatar'
              src={assetUrl(me.avatarUrl)}
              mode='aspectFill'
            />
          ) : (
            <View className='me__avatar me__avatar--placeholder'>🐾</View>
          )}
          <View className='me__info'>
            <Text className='me__name'>{me?.name ?? '微信用户'}</Text>
            <Text
              className={`me__level ${
                me?.memberLevel === 'VIP' ? 'me__level--vip' : ''
              }`}
            >
              {me ? MEMBER_LEVEL_LABEL[me.memberLevel] ?? me.memberLevel : ''}
            </Text>
          </View>
          <Text className='me__chevron'>›</Text>
        </View>
      </View>

      {loading && !me ? (
        <Skeleton count={1} variant='card' />
      ) : (
        <View className='me__stats card'>
          <View className='me__stat'>
            <Text className='me__stat-value'>
              ¥{((me?.memberBalance ?? 0) / 100).toFixed(2)}
            </Text>
            <Text className='me__stat-label'>余额</Text>
          </View>
          <View className='me__divider' />
          <View className='me__stat' onClick={goPoints}>
            <Text className='me__stat-value'>{me?.memberPoints ?? 0}</Text>
            <Text className='me__stat-label'>积分 ›</Text>
          </View>
        </View>
      )}

      <View className='me__menu card'>
        {menuItems.map((item, index) => (
          <View
            key={item.label}
            className={`me__menu-row ${
              index === menuItems.length - 1 ? 'me__menu-row--last' : ''
            }`}
            onClick={item.onClick}
          >
            <Text className='me__menu-icon'>{item.icon}</Text>
            <Text className='me__menu-label'>{item.label}</Text>
            <Text className='me__chevron'>›</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

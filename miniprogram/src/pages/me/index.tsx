import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { getMe } from '../../services/api'
import { assetUrl, MEMBER_LEVEL_LABEL } from '../../constants/config'
import type { Me } from '../../types'
import './index.scss'

export default function MePage() {
  const [me, setMe] = useState<Me | null>(null)

  useDidShow(() => {
    fetchMe()
  })

  const fetchMe = async () => {
    try {
      const { me } = await getMe()
      setMe(me)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  }

  const goPets = () => {
    Taro.navigateTo({ url: '/pages/pets/index' })
  }

  return (
    <View className='me'>
      <View className='me__header card'>
        {me?.avatarUrl ? (
          <Image className='me__avatar' src={assetUrl(me.avatarUrl)} mode='aspectFill' />
        ) : (
          <View className='me__avatar me__avatar--placeholder'>宠</View>
        )}
        <View className='me__info'>
          <Text className='me__name'>{me?.name ?? '-'}</Text>
          <Text className='me__level'>
            {me ? MEMBER_LEVEL_LABEL[me.memberLevel] ?? me.memberLevel : ''}
          </Text>
        </View>
      </View>

      <View className='me__stats card'>
        <View className='me__stat'>
          <Text className='me__stat-value'>
            ¥{((me?.memberBalance ?? 0) / 100).toFixed(2)}
          </Text>
          <Text className='me__stat-label'>余额</Text>
        </View>
        <View className='me__divider' />
        <View className='me__stat'>
          <Text className='me__stat-value'>{me?.memberPoints ?? 0}</Text>
          <Text className='me__stat-label'>积分</Text>
        </View>
      </View>

      <View className='me__menu card' onClick={goPets}>
        <Text>我的宠物</Text>
        <Text className='muted'>›</Text>
      </View>
    </View>
  )
}

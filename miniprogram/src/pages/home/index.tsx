import { useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { listServices } from '../../services/api'
import {
  assetUrl,
  SERVICE_CATEGORY_EMOJI,
  SERVICE_CATEGORY_LABEL,
  STORE_INFO,
} from '../../constants/config'
import { Empty } from '../../components/Empty'
import { Skeleton } from '../../components/Skeleton'
import type { PetshopService } from '../../types'
import './index.scss'

export default function Home() {
  const [services, setServices] = useState<PetshopService[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchServices()
  })

  usePullDownRefresh(async () => {
    await fetchServices()
    Taro.stopPullDownRefresh()
  })

  const fetchServices = async () => {
    try {
      const { services } = await listServices()
      setServices(services)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goBooking = (service: PetshopService) => {
    Taro.navigateTo({ url: `/pages/booking/index?serviceId=${service.id}` })
  }

  const goAppointments = () => {
    Taro.switchTab({ url: '/pages/appointments/index' })
  }

  const goPets = () => {
    Taro.navigateTo({ url: '/pages/pets/index' })
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

  const renderService = (service: PetshopService) => (
    <View
      key={service.id}
      className='service card'
      onClick={() => goBooking(service)}
    >
      {service.imageUrl ? (
        <Image
          className='service__thumb'
          src={assetUrl(service.imageUrl)}
          mode='aspectFill'
        />
      ) : (
        <View className='service__thumb service__thumb--placeholder'>
          {SERVICE_CATEGORY_EMOJI[service.category] ?? '🐾'}
        </View>
      )}
      <View className='service__body'>
        <View className='service__title-row'>
          <Text className='service__title'>{service.title}</Text>
          <Text className='service__tag'>
            {SERVICE_CATEGORY_LABEL[service.category] ?? '服务'}
          </Text>
        </View>
        <Text className='service__desc'>{service.description}</Text>
        <View className='service__bottom'>
          <Text className='service__price'>
            ¥{(service.value / 100).toFixed(2)}
          </Text>
          <Text className='service__cta'>立即预约</Text>
        </View>
      </View>
    </View>
  )

  return (
    <View className='home'>
      <View className='home__hero'>
        <Text className='home__greet'>欢迎光临</Text>
        <Text className='home__name'>{STORE_INFO.name}</Text>
        <View className='home__meta'>
          <Text className='home__meta-item'>🕘 {STORE_INFO.businessHours}</Text>
          <Text className='home__meta-item'>📍 {STORE_INFO.address}</Text>
        </View>
      </View>

      <View className='home__quick'>
        <View className='home__quick-item' onClick={goAppointments}>
          <Text className='home__quick-emoji'>📅</Text>
          <Text className='home__quick-text'>我的预约</Text>
        </View>
        <View className='home__quick-divider' />
        <View className='home__quick-item' onClick={goPets}>
          <Text className='home__quick-emoji'>🐶</Text>
          <Text className='home__quick-text'>我的宠物</Text>
        </View>
        <View className='home__quick-divider' />
        <View className='home__quick-item' onClick={callStore}>
          <Text className='home__quick-emoji'>📞</Text>
          <Text className='home__quick-text'>联系门店</Text>
        </View>
      </View>

      <View className='section'>
        <View className='section__head'>
          <Text className='section__title'>服务项目</Text>
          {!loading && services.length > 0 ? (
            <Text className='section__extra'>{services.length} 项可选</Text>
          ) : null}
        </View>

        {loading ? (
          <Skeleton count={3} />
        ) : services.length === 0 ? (
          <Empty
            title='暂无可用服务'
            desc='门店还没有上架服务项目，请稍后再来看看'
          />
        ) : (
          services.map(renderService)
        )}
      </View>
    </View>
  )
}

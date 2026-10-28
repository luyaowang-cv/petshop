import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { listServices } from '../../services/api'
import { assetUrl } from '../../constants/config'
import type { PetshopService } from '../../types'
import './index.scss'

export default function Home() {
  const [services, setServices] = useState<PetshopService[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchServices()
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

  return (
    <View className='home'>
      {loading ? (
        <View className='empty'>加载中…</View>
      ) : services.length === 0 ? (
        <View className='empty'>暂无可用服务</View>
      ) : (
        services.map((service) => (
          <View
            key={service.id}
            className='service-card card'
            onClick={() => goBooking(service)}
          >
            {service.imageUrl ? (
              <Image
                className='service-card__img'
                src={assetUrl(service.imageUrl)}
                mode='aspectFill'
              />
            ) : null}
            <View className='service-card__info'>
              <Text className='service-card__title'>{service.title}</Text>
              <Text className='service-card__desc'>{service.description}</Text>
              <Text className='service-card__price'>
                ¥{(service.value / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  )
}

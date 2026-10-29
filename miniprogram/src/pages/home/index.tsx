import { useMemo, useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { listServices } from '../../services/api'
import { assetUrl, STORE_INFO } from '../../constants/config'
import { Empty } from '../../components/Empty'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { PetshopService } from '../../types'
import './index.scss'


export default function Home() {
  const [services, setServices] = useState<PetshopService[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')

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

  // 按实际在售服务归纳品类（分类来自后端，可自由新增），避免出现空品类
  const categories = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; icon: string | null; sortOrder: number; total: number }
    >()
    services.forEach((s) => {
      const id = s.category?.id ?? '_uncategorized'
      const entry = map.get(id) ?? {
        id,
        name: s.category?.name ?? '未分类',
        icon: s.category?.icon ?? null,
        sortOrder: s.category?.sortOrder ?? 999,
        total: 0,
      }
      entry.total += 1
      map.set(id, entry)
    })
    return Array.from(map.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    )
  }, [services])

  const current =
    categories.some((c) => c.id === activeCategory) || categories.length === 0
      ? activeCategory
      : categories[0].id

  const visibleServices = current
    ? services.filter((s) => (s.category?.id ?? '_uncategorized') === current)
    : services

  const currentLabel =
    categories.find((c) => c.id === current)?.name ?? '全部服务'

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
          {service.category?.icon ?? '🐾'}
        </View>
      )}
      <View className='service__body'>
        <Text className='service__title'>{service.title}</Text>
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
      <PageBg />
      <View className='home__hero'>
        <Text className='home__greet'>欢迎光临</Text>
        <Text className='home__name'>{STORE_INFO.name}</Text>
        <View className='home__meta'>
          <Text className='home__meta-item'>🕘 {STORE_INFO.businessHours}</Text>
          <Text className='home__meta-item'>📍 {STORE_INFO.address}</Text>
        </View>
      </View>

      {loading ? (
        <Skeleton count={3} />
      ) : services.length === 0 ? (
        <Empty
          title='暂无可用服务'
          desc='门店还没有上架服务项目，请稍后再来看看'
        />
      ) : (
        <>
          <View className='section'>
            <View className='section__head'>
              <Text className='section__title'>选择服务分类</Text>
              <Text className='section__extra'>{services.length} 项服务</Text>
            </View>
            <View className='category-grid'>
              {categories.map((c) => (
                <View
                  key={c.id}
                  className={`category ${
                    current === c.id ? 'category--active' : ''
                  }`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  <View className='category__icon'>{c.icon ?? '🐾'}</View>
                  <View className='category__info'>
                    <Text className='category__name'>{c.name}</Text>
                    <Text className='category__count'>{c.total} 项</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className='section'>
            <View className='section__head'>
              <Text className='section__title'>{currentLabel}</Text>
              <Text className='section__extra'>
                {visibleServices.length} 项
              </Text>
            </View>
            {visibleServices.length === 0 ? (
              <Empty title='该分类暂无项目' desc='换一个分类看看吧' />
            ) : (
              visibleServices.map(renderService)
            )}
          </View>
        </>
      )}
    </View>
  )
}

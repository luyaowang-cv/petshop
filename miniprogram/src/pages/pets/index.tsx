import { useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { listPets } from '../../services/api'
import { assetUrl, PET_GENDER_LABEL, PET_TYPE_LABEL } from '../../constants/config'
import { Empty } from '../../components/Empty'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { Pet } from '../../types'
import './index.scss'

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchPets()
  })

  usePullDownRefresh(async () => {
    await fetchPets()
    Taro.stopPullDownRefresh()
  })

  const fetchPets = async () => {
    try {
      const { pets } = await listPets()
      setPets(pets)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/pet-detail/index?id=${id}` })
  }

  const goCreate = () => {
    Taro.navigateTo({ url: '/pages/pet-edit/index' })
  }

  return (
    <View className='pets'>
      <PageBg />
      {loading ? (
        <Skeleton count={3} variant='avatar' />
      ) : pets.length === 0 ? (
        <Empty
          icon='🐶'
          title='还没有宠物档案'
          desc='添加宠物后，预约时就能直接选择它啦'
          actionText='添加宠物'
          onAction={goCreate}
        />
      ) : (
        pets.map((pet) => (
          <View
            key={pet.id}
            className='pet-card card'
            onClick={() => goDetail(pet.id)}
          >
            {pet.imageUrl ? (
              <Image
                className='pet-card__img'
                src={assetUrl(pet.imageUrl)}
                mode='aspectFill'
              />
            ) : (
              <View className='pet-card__img pet-card__img--placeholder'>
                🐾
              </View>
            )}
            <View className='pet-card__info'>
              <Text className='pet-card__name'>{pet.name}</Text>
              <Text className='pet-card__meta'>
                {PET_TYPE_LABEL[pet.petType] ?? pet.petType} · {pet.breed} ·{' '}
                {PET_GENDER_LABEL[pet.gender] ?? pet.gender}
              </Text>
            </View>
            <Text className='pet-card__chevron'>›</Text>
          </View>
        ))
      )}

      {pets.length > 0 ? (
        <View className='pets__add btn-primary' onClick={goCreate}>
          新增宠物
        </View>
      ) : null}
    </View>
  )
}

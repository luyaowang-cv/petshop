import { useState } from 'react'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { deletePet, listPets } from '../../services/api'
import { assetUrl, PET_GENDER_LABEL, PET_TYPE_LABEL } from '../../constants/config'
import { formatDateTime } from '../../utils/format'
import type { Pet } from '../../types'
import './index.scss'

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <View className='field'>
      <Text className='field__label'>{label}</Text>
      <Text className='field__value'>{value}</Text>
    </View>
  )
}

export default function PetDetail() {
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    const id = router.params.id
    if (id) fetchPet(id)
  })

  const fetchPet = async (id: string) => {
    try {
      const { pets } = await listPets()
      setPet(pets.find((p) => p.id === id) ?? null)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goEdit = () => {
    if (pet) Taro.navigateTo({ url: `/pages/pet-edit/index?id=${pet.id}` })
  }

  const onDelete = async () => {
    if (!pet) return
    const modal = await Taro.showModal({
      title: '删除宠物',
      content: `确定删除「${pet.name}」吗？`,
    })
    if (!modal.confirm) return
    try {
      await deletePet(pet.id)
      Taro.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  }

  if (loading) {
    return <View className='empty'>加载中…</View>
  }

  if (!pet) {
    return <View className='empty'>宠物不存在</View>
  }

  return (
    <View className='pet-detail'>
      <View className='pet-detail__header card'>
        {pet.imageUrl ? (
          <Image
            className='pet-detail__img'
            src={assetUrl(pet.imageUrl)}
            mode='aspectFill'
          />
        ) : (
          <View className='pet-detail__img pet-detail__img--placeholder'>
            宠
          </View>
        )}
        <View className='pet-detail__info'>
          <Text className='pet-detail__name'>{pet.name}</Text>
          <Text className='pet-detail__meta'>
            {PET_TYPE_LABEL[pet.petType] ?? pet.petType} · {pet.breed} ·{' '}
            {PET_GENDER_LABEL[pet.gender] ?? pet.gender}
          </Text>
        </View>
      </View>

      <View className='card'>
        <Field label='年龄' value={pet.age != null ? `${pet.age} 岁` : null} />
        <Field
          label='生日'
          value={pet.birthday ? formatDateTime(pet.birthday) : null}
        />
        <Field label='是否绝育' value={pet.isNeutered ? '已绝育' : '未绝育'} />
        <Field label='疫苗信息' value={pet.vaccineInfo} />
        <Field label='过敏史' value={pet.allergyHistory} />
        <Field label='健康备注' value={pet.healthNotes} />
        <Field
          label='最近美容'
          value={pet.lastGroomingAt ? formatDateTime(pet.lastGroomingAt) : null}
        />
      </View>

      <View className='pet-detail__actions'>
        <View className='btn-primary' onClick={goEdit}>
          编辑
        </View>
        <View className='pet-detail__delete' onClick={onDelete}>
          删除
        </View>
      </View>
    </View>
  )
}

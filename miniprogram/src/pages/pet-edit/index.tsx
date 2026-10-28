import { useState } from 'react'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import {
  View,
  Text,
  Input,
  Textarea,
  Picker,
  Switch,
  Image,
} from '@tarojs/components'
import { createPet, listPets, updatePet, uploadImage } from '../../services/api'
import {
  assetUrl,
  PET_GENDER_LABEL,
  PET_TYPE_LABEL,
} from '../../constants/config'
import { Skeleton } from '../../components/Skeleton'
import type { PetGender, PetInput, PetType } from '../../types'
import './index.scss'

const PET_TYPES: PetType[] = ['CAT', 'DOG', 'OTHER']
const PET_TYPE_OPTIONS = PET_TYPES.map((t) => PET_TYPE_LABEL[t])

const GENDERS: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN']
const GENDER_OPTIONS = GENDERS.map((g) => PET_GENDER_LABEL[g])

function toDateOnly(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function PetEdit() {
  const router = useRouter()
  const id = router.params.id

  const [name, setName] = useState('')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('')
  const [petType, setPetType] = useState<PetType>('DOG')
  const [gender, setGender] = useState<PetGender>('MALE')
  const [isNeutered, setIsNeutered] = useState(false)
  const [birthday, setBirthday] = useState('')
  const [vaccineInfo, setVaccineInfo] = useState('')
  const [allergyHistory, setAllergyHistory] = useState('')
  const [healthNotes, setHealthNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(!!id)

  useLoad(() => {
    if (id) fetchPet(id)
  })

  const fetchPet = async (petId: string) => {
    try {
      const { pets } = await listPets()
      const pet = pets.find((p) => p.id === petId)
      if (pet) {
        setName(pet.name)
        setBreed(pet.breed)
        setAge(String(pet.age))
        setPetType(pet.petType)
        setGender(pet.gender)
        setIsNeutered(pet.isNeutered)
        setBirthday(toDateOnly(pet.birthday))
        setVaccineInfo(pet.vaccineInfo ?? '')
        setAllergyHistory(pet.allergyHistory ?? '')
        setHealthNotes(pet.healthNotes ?? '')
        setImageUrl(pet.imageUrl ?? '')
      }
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const chooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      const filePath = res.tempFilePaths[0]
      Taro.showLoading({ title: '上传中…' })
      const url = await uploadImage(filePath)
      setImageUrl(url)
      Taro.hideLoading()
    } catch (e) {
      Taro.hideLoading()
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  }

  const onSubmit = async () => {
    if (!name.trim() || !breed.trim()) {
      Taro.showToast({ title: '请填写姓名和品种', icon: 'none' })
      return
    }
    const ageNum = Number(age)
    if (age === '' || Number.isNaN(ageNum) || ageNum < 0) {
      Taro.showToast({ title: '请填写正确的年龄', icon: 'none' })
      return
    }

    const payload: PetInput = {
      name: name.trim(),
      breed: breed.trim(),
      age: ageNum,
      petType,
      gender,
      isNeutered,
      birthday: birthday || undefined,
      vaccineInfo: vaccineInfo || undefined,
      allergyHistory: allergyHistory || undefined,
      healthNotes: healthNotes || undefined,
      imageUrl: imageUrl || undefined,
    }

    try {
      if (id) await updatePet(id, payload)
      else await createPet(payload)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  }

  if (loading) {
    return <Skeleton count={2} variant='card' />
  }

  return (
    <View className='pet-edit'>
      <View className='pet-edit__photo' onClick={chooseImage}>
        {imageUrl ? (
          <Image
            className='pet-edit__img'
            src={assetUrl(imageUrl)}
            mode='aspectFill'
          />
        ) : (
          <View className='pet-edit__img pet-edit__img--placeholder'>+</View>
        )}
        <Text className='muted'>点击上传照片（可选）</Text>
      </View>

      <View className='card'>
        <View className='form-row'>
          <Text className='form-row__label'>姓名 *</Text>
          <Input
            className='form-row__input'
            value={name}
            onInput={(e) => setName(e.detail.value)}
            placeholder='请输入宠物姓名'
          />
        </View>
        <View className='form-row'>
          <Text className='form-row__label'>品种 *</Text>
          <Input
            className='form-row__input'
            value={breed}
            onInput={(e) => setBreed(e.detail.value)}
            placeholder='如 金毛 / 英短'
          />
        </View>
        <View className='form-row'>
          <Text className='form-row__label'>类型</Text>
          <Picker
            mode='selector'
            range={PET_TYPE_OPTIONS}
            value={PET_TYPES.indexOf(petType)}
            onChange={(e) => setPetType(PET_TYPES[Number(e.detail.value)])}
          >
            <View className='form-row__picker'>
              {PET_TYPE_LABEL[petType]} ›
            </View>
          </Picker>
        </View>
        <View className='form-row'>
          <Text className='form-row__label'>性别</Text>
          <Picker
            mode='selector'
            range={GENDER_OPTIONS}
            value={GENDERS.indexOf(gender)}
            onChange={(e) => setGender(GENDERS[Number(e.detail.value)])}
          >
            <View className='form-row__picker'>
              {PET_GENDER_LABEL[gender]} ›
            </View>
          </Picker>
        </View>
        <View className='form-row'>
          <Text className='form-row__label'>年龄 *</Text>
          <Input
            className='form-row__input'
            type='number'
            value={age}
            onInput={(e) => setAge(e.detail.value)}
            placeholder='如 2'
          />
        </View>
        <View className='form-row'>
          <Text className='form-row__label'>生日</Text>
          <Picker
            mode='date'
            value={birthday}
            onChange={(e) => setBirthday(e.detail.value)}
          >
            <View className='form-row__picker'>
              {birthday || '请选择'} ›
            </View>
          </Picker>
        </View>
        <View className='form-row'>
          <Text className='form-row__label'>是否绝育</Text>
          <Switch
            checked={isNeutered}
            onChange={(e) => setIsNeutered(e.detail.value)}
          />
        </View>
      </View>

      <View className='card'>
        <View className='form-row form-row--column'>
          <Text className='form-row__label'>疫苗信息</Text>
          <Textarea
            className='form-row__textarea'
            value={vaccineInfo}
            onInput={(e) => setVaccineInfo(e.detail.value)}
            placeholder='疫苗种类与接种时间'
          />
        </View>
        <View className='form-row form-row--column'>
          <Text className='form-row__label'>过敏史</Text>
          <Textarea
            className='form-row__textarea'
            value={allergyHistory}
            onInput={(e) => setAllergyHistory(e.detail.value)}
            placeholder='有无过敏史'
          />
        </View>
        <View className='form-row form-row--column'>
          <Text className='form-row__label'>健康备注</Text>
          <Textarea
            className='form-row__textarea'
            value={healthNotes}
            onInput={(e) => setHealthNotes(e.detail.value)}
            placeholder='其他健康情况'
          />
        </View>
      </View>

      <View className='pet-edit__save btn-primary' onClick={onSubmit}>
        保存
      </View>
    </View>
  )
}

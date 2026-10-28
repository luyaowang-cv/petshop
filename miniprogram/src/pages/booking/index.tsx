import { useState } from 'react'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { View, Text, Picker, Textarea } from '@tarojs/components'
import { createAppointment, listPets, listServices } from '../../services/api'
import type { Pet, PetshopService } from '../../types'
import './index.scss'

export default function Booking() {
  const router = useRouter()
  const serviceId = router.params.serviceId

  const [service, setService] = useState<PetshopService | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [petIndex, setPetIndex] = useState(0)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    fetchData()
  })

  const fetchData = async () => {
    try {
      const [servicesRes, petsRes] = await Promise.all([
        listServices(),
        listPets(),
      ])
      setService(servicesRes.services.find((s) => s.id === serviceId) ?? null)
      setPets(petsRes.pets)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goAddPet = () => {
    Taro.navigateTo({ url: '/pages/pet-edit/index' })
  }

  const onSubmit = async () => {
    if (!service) return
    if (pets.length === 0) {
      Taro.showToast({ title: '请先添加宠物', icon: 'none' })
      return
    }
    if (!date || !time) {
      Taro.showToast({ title: '请选择预约时间', icon: 'none' })
      return
    }
    const appointmentTime = new Date(`${date}T${time}:00`)
    if (Number.isNaN(appointmentTime.getTime()) || appointmentTime.getTime() <= Date.now()) {
      Taro.showToast({ title: '预约时间需晚于当前时间', icon: 'none' })
      return
    }

    try {
      await createAppointment({
        petId: pets[petIndex].id,
        serviceId: service.id,
        appointmentTime: appointmentTime.toISOString(),
        customerNote: note.trim() || undefined,
      })
      Taro.showToast({ title: '预约成功，等待审核', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/appointments/index' })
      }, 600)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  }

  if (loading) {
    return <View className='empty'>加载中…</View>
  }

  return (
    <View className='booking'>
      {service ? (
        <View className='booking__service card'>
          <Text className='booking__service-title'>{service.title}</Text>
          <Text className='booking__service-price'>
            ¥{(service.value / 100).toFixed(2)}
          </Text>
        </View>
      ) : null}

      {pets.length === 0 ? (
        <View className='card'>
          <Text className='muted'>还没有宠物，请先添加</Text>
          <View className='booking__add-pet' onClick={goAddPet}>
            去添加宠物
          </View>
        </View>
      ) : (
        <View className='card'>
          <View className='form-row'>
            <Text className='form-row__label'>选择宠物</Text>
            <Picker
              mode='selector'
              range={pets.map((p) => p.name)}
              value={petIndex}
              onChange={(e) => setPetIndex(Number(e.detail.value))}
            >
              <View className='form-row__picker'>{pets[petIndex].name} ›</View>
            </Picker>
          </View>
          <View className='form-row'>
            <Text className='form-row__label'>预约日期</Text>
            <Picker
              mode='date'
              value={date}
              onChange={(e) => setDate(e.detail.value)}
            >
              <View className='form-row__picker'>{date || '请选择'} ›</View>
            </Picker>
          </View>
          <View className='form-row'>
            <Text className='form-row__label'>预约时间</Text>
            <Picker
              mode='time'
              value={time}
              onChange={(e) => setTime(e.detail.value)}
            >
              <View className='form-row__picker'>{time || '请选择'} ›</View>
            </Picker>
          </View>
        </View>
      )}

      <View className='card'>
        <View className='form-row form-row--column'>
          <Text className='form-row__label'>备注（可选）</Text>
          <Textarea
            className='form-row__textarea'
            value={note}
            onInput={(e) => setNote(e.detail.value)}
            placeholder='如：狗狗怕水，请温柔一些'
          />
        </View>
      </View>

      <View
        className={`booking__submit btn-primary ${
          pets.length === 0 ? 'btn-disabled' : ''
        }`}
        onClick={onSubmit}
      >
        提交预约
      </View>
    </View>
  )
}

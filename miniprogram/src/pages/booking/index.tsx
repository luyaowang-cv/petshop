import { useState } from 'react'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { View, Text, Picker, Textarea } from '@tarojs/components'
import {
  createAppointment,
  getAppointmentAvailability,
  listPets,
  listServices,
} from '../../services/api'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { Pet, PetshopService } from '../../types'
import './index.scss'

// 预约时段：上午 / 下午 / 晚上，30 分钟一段（整店独占）
const SLOT_GROUPS = [
  {
    title: '上午',
    slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  },
  {
    title: '下午',
    slots: [
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
    ],
  },
  { title: '晚上', slots: ['18:00', '18:30', '19:00'] },
]
const SLOT_MS = 30 * 60 * 1000

// 查询某天占用情况的时间范围（覆盖首末时段）
const DAY_START = '09:00:00'
const DAY_END = '19:30:00'

export default function Booking() {
  const router = useRouter()
  const serviceId = router.params.serviceId

  const [service, setService] = useState<PetshopService | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [petIndex, setPetIndex] = useState(0)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
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

  const onDateChange = async (e: any) => {
    const next = e.detail.value
    setDate(next)
    setTime('')
    if (!next) {
      setBookedTimes([])
      return
    }
    try {
      // 后端按 UTC 范围查询；起始/结束用与提交预约相同的本地时间约定
      const startDate = new Date(`${next}T${DAY_START}`).toISOString()
      const endDate = new Date(`${next}T${DAY_END}`).toISOString()
      const res = await getAppointmentAvailability(startDate, endDate)
      setBookedTimes(res.bookedTimes)
    } catch {
      setBookedTimes([])
    }
  }

  const isSlotBooked = (slot: string) => {
    const startMs = new Date(`${date}T${slot}:00`).getTime()
    const endMs = startMs + SLOT_MS
    return bookedTimes.some((iso) => {
      const ms = new Date(iso).getTime()
      return ms >= startMs && ms < endMs
    })
  }

  const renderSlots = (slots: string[]) => (
    <View className='booking__slots'>
      {slots.map((slot) => {
        const booked = isSlotBooked(slot)
        const selected = time === slot
        return (
          <View
            key={slot}
            className={`booking__slot ${
              booked ? 'booking__slot--booked' : ''
            } ${selected ? 'booking__slot--selected' : ''}`}
            onClick={() => {
              if (!booked) setTime(slot)
            }}
          >
            <Text>{booked ? `${slot} 已满` : slot}</Text>
          </View>
        )
      })}
    </View>
  )

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
    if (isSlotBooked(time)) {
      Taro.showToast({ title: '该时间段已被预约', icon: 'none' })
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
    return <Skeleton count={2} variant='card' />
  }

  const submitDisabled = pets.length === 0 || !date || !time

  return (
    <View className='booking'>
      <PageBg />
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
              onChange={onDateChange}
            >
              <View className='form-row__picker'>{date || '请选择'} ›</View>
            </Picker>
          </View>
        </View>
      )}

      {date ? (
        <View className='card'>
          {SLOT_GROUPS.map((group) => (
            <View key={group.title}>
              <Text className='booking__slots-title'>{group.title}</Text>
              {renderSlots(group.slots)}
            </View>
          ))}
        </View>
      ) : null}

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
          submitDisabled ? 'btn-disabled' : ''
        }`}
        onClick={onSubmit}
      >
        提交预约
      </View>
    </View>
  )
}

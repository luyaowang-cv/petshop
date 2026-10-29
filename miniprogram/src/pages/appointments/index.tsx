import { useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { cancelAppointment, listAppointments } from '../../services/api'
import { APPOINTMENT_STATUS_LABEL } from '../../constants/config'
import { formatDateTime } from '../../utils/format'
import { Empty } from '../../components/Empty'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { Appointment } from '../../types'
import './index.scss'

const ACTIVE_STATUSES: Appointment['status'][] = [
  'PENDING',
  'CONFIRMED',
  'DONE',
  'PENDING_PAYMENT',
]

function canCancel(status: Appointment['status']): boolean {
  return status === 'PENDING' || status === 'CONFIRMED'
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchList()
  })

  usePullDownRefresh(async () => {
    await fetchList()
    Taro.stopPullDownRefresh()
  })

  const fetchList = async () => {
    try {
      const { appointments } = await listAppointments()
      setAppointments(appointments)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const onCancel = async (id: string) => {
    const modal = await Taro.showModal({
      title: '取消预约',
      content: '确定取消该预约吗？',
    })
    if (!modal.confirm) return
    try {
      await cancelAppointment(id)
      Taro.showToast({ title: '已取消', icon: 'success' })
      fetchList()
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  }

  const goRebook = (appt: Appointment) => {
    const serviceId = appt.service?.id ?? appt.serviceId
    if (!serviceId) {
      Taro.showToast({ title: '该服务已下架', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: `/pages/booking/index?serviceId=${serviceId}` })
  }

  const goHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  const active = appointments
    .filter((a) => ACTIVE_STATUSES.includes(a.status))
    .sort(
      (a, b) =>
        new Date(a.appointmentTime).getTime() -
        new Date(b.appointmentTime).getTime(),
    )

  const history = appointments
    .filter((a) => !ACTIVE_STATUSES.includes(a.status))
    .sort(
      (a, b) =>
        new Date(b.appointmentTime).getTime() -
        new Date(a.appointmentTime).getTime(),
    )

  const renderCard = (appt: Appointment) => (
    <View key={appt.id} className='appt card'>
      <View className='appt__head'>
        <Text className='appt__service'>
          {appt.service?.title ?? '宠物服务'}
        </Text>
        <Text className={`pill pill--${appt.status.toLowerCase()}`}>
          {APPOINTMENT_STATUS_LABEL[appt.status] ?? appt.status}
        </Text>
      </View>

      <View className='appt__row'>
        <Text className='appt__k'>宠物</Text>
        <Text className='appt__v'>{appt.pet?.name ?? '-'}</Text>
      </View>
      <View className='appt__row'>
        <Text className='appt__k'>时间</Text>
        <Text className='appt__v'>{formatDateTime(appt.appointmentTime)}</Text>
      </View>
      {appt.customerNote ? (
        <View className='appt__row'>
          <Text className='appt__k'>备注</Text>
          <Text className='appt__v'>{appt.customerNote}</Text>
        </View>
      ) : null}
      {appt.status === 'REJECTED' && appt.rejectReason ? (
        <View className='appt__row'>
          <Text className='appt__k'>拒因</Text>
          <Text className='appt__v appt__v--danger'>{appt.rejectReason}</Text>
        </View>
      ) : null}

      {canCancel(appt.status) || appt.service ? (
        <View className='appt__actions'>
          {canCancel(appt.status) ? (
            <View
              className='appt__btn appt__btn--ghost'
              onClick={() => onCancel(appt.id)}
            >
              取消预约
            </View>
          ) : null}
          {!canCancel(appt.status) && appt.service ? (
            <View
              className='appt__btn appt__btn--primary'
              onClick={() => goRebook(appt)}
            >
              再次预约
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  )

  return (
    <View className='appointments'>
      <PageBg />
      {loading ? (
        <Skeleton count={3} variant='card' />
      ) : appointments.length === 0 ? (
        <Empty
          icon='📅'
          title='还没有预约记录'
          desc='挑一个喜欢的服务，约个时间到店吧'
          actionText='去预约'
          onAction={goHome}
        />
      ) : (
        <>
          {active.length > 0 ? (
            <View className='section'>
              <View className='section__head'>
                <Text className='section__title'>进行中</Text>
                <Text className='section__extra'>{active.length} 个</Text>
              </View>
              {active.map(renderCard)}
            </View>
          ) : null}

          {history.length > 0 ? (
            <View className='section'>
              <View className='section__head'>
                <Text className='section__title'>历史记录</Text>
                <Text className='section__extra'>{history.length} 个</Text>
              </View>
              {history.map(renderCard)}
            </View>
          ) : null}
        </>
      )}
    </View>
  )
}

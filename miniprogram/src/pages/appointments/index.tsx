import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { cancelAppointment, listAppointments } from '../../services/api'
import { APPOINTMENT_STATUS_LABEL } from '../../constants/config'
import { formatDateTime } from '../../utils/format'
import type { Appointment } from '../../types'
import './index.scss'

function canCancel(status: Appointment['status']): boolean {
  return status === 'PENDING' || status === 'CONFIRMED'
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchList()
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

  return (
    <View className='appointments'>
      {loading ? (
        <View className='empty'>加载中…</View>
      ) : appointments.length === 0 ? (
        <View className='empty'>暂无预约</View>
      ) : (
        appointments.map((appt) => (
          <View key={appt.id} className='appt card'>
            <View className='row'>
              <Text className='appt__service'>
                {appt.service?.title ?? '宠物服务'}
              </Text>
              <Text
                className={`appt__status appt__status--${appt.status.toLowerCase()}`}
              >
                {APPOINTMENT_STATUS_LABEL[appt.status] ?? appt.status}
              </Text>
            </View>
            <Text className='appt__pet'>宠物：{appt.pet?.name ?? '-'}</Text>
            <Text className='appt__time'>
              预约时间：{formatDateTime(appt.appointmentTime)}
            </Text>
            {appt.customerNote ? (
              <Text className='appt__note'>备注：{appt.customerNote}</Text>
            ) : null}
            {appt.status === 'REJECTED' && appt.rejectReason ? (
              <Text className='appt__reject'>拒绝理由：{appt.rejectReason}</Text>
            ) : null}
            {canCancel(appt.status) ? (
              <View className='appt__cancel' onClick={() => onCancel(appt.id)}>
                取消预约
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  )
}

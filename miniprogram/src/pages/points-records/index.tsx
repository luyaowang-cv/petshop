import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getMe, getPointsRecords } from '../../services/api'
import { formatDateTime } from '../../utils/format'
import { Empty } from '../../components/Empty'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { PointsAction, PointsRecord } from '../../types'
import './index.scss'

const ACTION_LABEL: Record<PointsAction, string> = {
  ADD: '积分增加',
  CONSUME: '消费获得',
  DEDUCT: '积分扣减',
  EXPIRE: '积分过期',
}

// 只有这两种是加分的
const POSITIVE_ACTIONS: PointsAction[] = ['ADD', 'CONSUME']

export default function PointsRecords() {
  const [records, setRecords] = useState<PointsRecord[]>([])
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useLoad(async () => {
    try {
      const [listRes, meRes] = await Promise.all([getPointsRecords(), getMe()])
      setRecords(listRes.records)
      setPoints(meRes.me.memberPoints)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
    }
  })

  return (
    <View className='points'>
      <PageBg />

      <View className='points__summary card'>
        <Text className='points__value'>{points}</Text>
        <Text className='points__label'>当前积分</Text>
      </View>

      {loading ? (
        <Skeleton count={3} variant='card' />
      ) : records.length === 0 ? (
        <Empty
          icon='⭐'
          title='还没有积分记录'
          desc='消费完成或充值后，积分会自动记在这里'
        />
      ) : (
        records.map((record) => {
          const positive = POSITIVE_ACTIONS.includes(record.action)
          return (
            <View key={record.id} className='point card'>
              <View className='point__main'>
                <Text className='point__reason'>
                  {record.reason || ACTION_LABEL[record.action]}
                </Text>
                <Text className='point__time'>
                  {formatDateTime(record.createdAt)}
                </Text>
              </View>
              <View className='point__right'>
                <Text
                  className={`point__delta ${
                    positive ? 'point__delta--up' : 'point__delta--down'
                  }`}
                >
                  {positive ? '+' : '-'}
                  {record.points}
                </Text>
                <Text className='point__balance'>余额 {record.balance}</Text>
              </View>
            </View>
          )
        })
      )}
    </View>
  )
}

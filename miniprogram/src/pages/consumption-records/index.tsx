import { useState } from 'react'
import Taro, { useLoad, useReachBottom } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { getConsumptionRecords } from '../../services/api'
import { formatDateTime } from '../../utils/format'
import { Empty } from '../../components/Empty'
import { Skeleton } from '../../components/Skeleton'
import { PageBg } from '../../components/PageBg'
import type { ConsumptionRecord } from '../../types'
import './index.scss'

const PAGE_SIZE = 20

export default function ConsumptionRecords() {
  const [records, setRecords] = useState<ConsumptionRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useLoad(() => {
    fetchPage(1)
  })

  useReachBottom(() => {
    if (loadingMore || records.length >= total) return
    fetchPage(page + 1)
  })

  const fetchPage = async (nextPage: number) => {
    if (nextPage > 1) setLoadingMore(true)
    try {
      const res = await getConsumptionRecords(nextPage, PAGE_SIZE)
      setRecords((prev) =>
        nextPage === 1 ? res.records : [...prev, ...res.records],
      )
      setTotal(res.total)
      setPage(nextPage)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  return (
    <View className='records'>
      <PageBg />

      <View className='records__summary card'>
        <View className='records__summary-item'>
          <Text className='records__summary-value'>{total}</Text>
          <Text className='records__summary-label'>消费笔数</Text>
        </View>
      </View>

      {loading ? (
        <Skeleton count={3} variant='card' />
      ) : records.length === 0 ? (
        <Empty
          icon='🧾'
          title='还没有消费记录'
          desc='到店消费后，这里会显示每一笔明细'
        />
      ) : (
        <>
          {records.map((record) => (
            <View key={`${record.type}-${record.id}`} className='record card'>
              <View className='record__head'>
                <View
                  className={`record__badge ${
                    record.type === 'SERVICE'
                      ? 'record__badge--service'
                      : 'record__badge--product'
                  }`}
                >
                  {record.type === 'SERVICE' ? '服务' : '商品'}
                </View>
                <Text className='record__status'>{record.status}</Text>
              </View>

              {record.items.map((item, index) => (
                <Text key={index} className='record__item'>
                  {item}
                </Text>
              ))}

              {record.note ? (
                <Text className='record__note'>备注：{record.note}</Text>
              ) : null}

              <View className='record__foot'>
                <Text className='record__date'>
                  {formatDateTime(record.date)}
                </Text>
                <Text className='record__amount'>
                  ¥{(record.amount / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <Text className='records__more'>
            {loadingMore
              ? '加载中…'
              : records.length >= total
                ? '没有更多了'
                : '上拉加载更多'}
          </Text>
        </>
      )}
    </View>
  )
}

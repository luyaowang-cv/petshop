import { View, Text } from '@tarojs/components'
import './index.scss'

interface EmptyProps {
  title?: string
  desc?: string
  icon?: string
  actionText?: string
  onAction?: () => void
}

export function Empty({
  title = '暂无内容',
  desc,
  icon = '🐾',
  actionText,
  onAction,
}: EmptyProps) {
  return (
    <View className='empty-state'>
      <View className='empty-state__icon'>{icon}</View>
      <Text className='empty-state__title'>{title}</Text>
      {desc ? <Text className='empty-state__desc'>{desc}</Text> : null}
      {actionText ? (
        <View className='empty-state__action' onClick={onAction}>
          {actionText}
        </View>
      ) : null}
    </View>
  )
}

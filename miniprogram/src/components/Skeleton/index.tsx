import { View } from '@tarojs/components'
import './index.scss'

interface SkeletonProps {
  /** 占位卡片数量 */
  count?: number
  /** avatar：左图右文；card：通栏文字块 */
  variant?: 'avatar' | 'card'
}

export function Skeleton({ count = 3, variant = 'avatar' }: SkeletonProps) {
  return (
    <View className='skeleton'>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className='skeleton__card'>
          {variant === 'avatar' ? (
            <View className='skeleton__avatar skeleton__block' />
          ) : null}
          <View className='skeleton__lines'>
            <View
              className='skeleton__block skeleton__line skeleton__line--title'
            />
            <View className='skeleton__block skeleton__line' />
            <View
              className='skeleton__block skeleton__line skeleton__line--short'
            />
          </View>
        </View>
      ))}
    </View>
  )
}

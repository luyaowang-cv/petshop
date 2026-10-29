import { View, Image } from '@tarojs/components'
import { PAGE_BG } from '../../constants/config'
import './index.scss'

/**
 * 全局页面背景：模糊底图 + 半透明蒙版。
 * 图片已在构建前做过高斯模糊，这里只需铺满并压一层蒙版保证文字可读。
 * 用 z-index: -1 垫在所有内容之下。
 */
export function PageBg() {
  return (
    <View className='page-bg'>
      <Image className='page-bg__img' src={PAGE_BG} mode='aspectFill' />
      <View className='page-bg__mask' />
    </View>
  )
}

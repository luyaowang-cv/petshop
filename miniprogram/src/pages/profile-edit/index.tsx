import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { View, Text, Image, Button, Input } from '@tarojs/components'
import { getMe, updateMyProfile, uploadImage } from '../../services/api'
import { assetUrl } from '../../constants/config'
import './index.scss'

export default function ProfileEdit() {
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [tempAvatar, setTempAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  useLoad(async () => {
    try {
      const { me } = await getMe()
      setName(me.name)
      setAvatarUrl(me.avatarUrl ?? '')
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    }
  })

  const onChooseAvatar = (e: any) => {
    const url = e?.detail?.avatarUrl
    if (url) setTempAvatar(url)
  }

  const onSave = async () => {
    if (saving) return
    const trimmed = name.trim()
    if (!trimmed) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    setSaving(true)
    try {
      let nextAvatar = avatarUrl
      if (tempAvatar) {
        nextAvatar = await uploadImage(tempAvatar)
      }
      await updateMyProfile({ name: trimmed, avatarUrl: nextAvatar })
      Taro.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (e) {
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = tempAvatar || assetUrl(avatarUrl)

  return (
    <View className='profile-edit'>
      <View className='profile-edit__avatar-card'>
        <Button
          className='profile-edit__avatar-btn'
          openType='chooseAvatar'
          onChooseAvatar={onChooseAvatar}
        >
          {avatarSrc ? (
            <Image
              className='profile-edit__avatar'
              src={avatarSrc}
              mode='aspectFill'
            />
          ) : (
            <View className='profile-edit__avatar profile-edit__avatar--placeholder'>
              🐾
            </View>
          )}
        </Button>
        <Text className='profile-edit__hint'>点击更换头像</Text>
      </View>

      <View className='card'>
        <View className='profile-edit__row'>
          <Text className='profile-edit__label'>昵称</Text>
          <Input
            className='profile-edit__input'
            type='nickname'
            value={name}
            placeholder='请输入昵称'
            maxlength={20}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>
      </View>

      <View
        className={`profile-edit__submit btn-primary ${saving ? 'is-disabled' : ''}`}
        onClick={onSave}
      >
        {saving ? '保存中…' : '保存'}
      </View>
    </View>
  )
}

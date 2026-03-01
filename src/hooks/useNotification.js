import { useState } from 'react'
import { getToken } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { getMessagingInstance } from '../firebase/config'
import { db } from '../firebase/config'

export function useNotification(user) {
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const registerFcmToken = async () => {
    if (typeof Notification === 'undefined') return
    if (!user) return

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.warn('VITE_FIREBASE_VAPID_KEY 환경변수가 설정되지 않았습니다.')
      return
    }

    try {
      const messaging = await getMessagingInstance()
      if (!messaging) return

      const token = await getToken(messaging, { vapidKey })
      if (!token) return

      await setDoc(doc(db, 'fcmTokens', user.uid), {
        token,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('FCM 토큰 등록 실패:', err)
    }
  }

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'unsupported'

    const result = await Notification.requestPermission()
    setPermissionStatus(result)

    if (result === 'granted') {
      await registerFcmToken()
    }

    return result
  }

  // 기존 코드와의 호환성을 위해 scheduleTasks는 빈 함수로 유지
  const scheduleTasks = () => {}

  return { permissionStatus, requestPermission, scheduleTasks }
}

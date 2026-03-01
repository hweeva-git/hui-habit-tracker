const { onSchedule } = require('firebase-functions/v2/scheduler')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')

initializeApp()

const db = getFirestore()

// 현재 KST 날짜의 요일 반환 (0=일, 1=월 ... 6=토)
function getDayOfWeek(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDay()
}

// KST 기준 현재 날짜 (YYYY-MM-DD)
function getKstDateKey(kstNow) {
  const y = kstNow.getUTCFullYear()
  const m = String(kstNow.getUTCMonth() + 1).padStart(2, '0')
  const d = String(kstNow.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

exports.sendHabitNotifications = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Asia/Seoul',
  },
  async () => {
    const now = new Date()

    // UTC+9 (KST) 기준 시간 계산
    const kstOffset = 9 * 60 * 60 * 1000
    const kstNow = new Date(now.getTime() + kstOffset)

    const hours = String(kstNow.getUTCHours()).padStart(2, '0')
    const minutes = String(kstNow.getUTCMinutes()).padStart(2, '0')
    const currentTime = `${hours}:${minutes}`
    const todayKST = getKstDateKey(kstNow)
    const todayDow = getDayOfWeek(todayKST)

    // 현재 시각에 알림이 설정된 습관 조회
    const habitsSnapshot = await db
      .collection('habits')
      .where('alertTime', '==', currentTime)
      .get()

    if (habitsSnapshot.empty) return

    const sendPromises = []

    for (const habitDoc of habitsSnapshot.docs) {
      const habit = habitDoc.data()
      const repeatType = habit.repeatType ?? (habit.isRecurring ? 'daily' : 'once')
      const startDate = habit.startDate ?? null

      // startDate 이전이면 건너뜀
      if (startDate && todayKST < startDate) continue

      // repeatType에 따라 오늘 표시 여부 판단
      if (repeatType === 'daily') {
        // 매일 - 통과
      } else if (repeatType === 'weekly') {
        if (!Array.isArray(habit.repeatDays) || !habit.repeatDays.includes(todayDow)) continue
      } else {
        // once - startDate가 오늘인 경우만
        if (startDate !== todayKST) continue
      }

      // 해당 사용자의 FCM 토큰 조회
      const tokenDoc = await db.collection('fcmTokens').doc(habit.uid).get()
      if (!tokenDoc.exists) continue

      const { token } = tokenDoc.data()
      if (!token) continue

      const message = {
        token,
        webpush: {
          notification: {
            title: '습관 트래커',
            body: `지금 "${habit.name}" 할 시간이에요!`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            requireInteraction: true,
            vibrate: [200, 100, 200],
          },
          headers: {
            Urgency: 'high',
          },
        },
        android: {
          notification: {
            title: '습관 트래커',
            body: `지금 "${habit.name}" 할 시간이에요!`,
            channelId: 'habit-alerts',
            priority: 'high',
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: '습관 트래커',
                body: `지금 "${habit.name}" 할 시간이에요!`,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      }

      sendPromises.push(
        getMessaging()
          .send(message)
          .catch((err) => {
            // 토큰이 만료된 경우 Firestore에서 제거
            if (
              err.code === 'messaging/registration-token-not-registered' ||
              err.code === 'messaging/invalid-registration-token'
            ) {
              return db.collection('fcmTokens').doc(habit.uid).delete()
            }
            console.error(`FCM 발송 실패 (uid: ${habit.uid}):`, err.message)
          })
      )
    }

    await Promise.all(sendPromises)
  }
)

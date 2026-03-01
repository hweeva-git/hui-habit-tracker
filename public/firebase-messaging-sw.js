importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// 브라우저가 꺼진 상태에서도 동작하려면 서비스 워커에 설정을 직접 포함해야 함
firebase.initializeApp({
  apiKey: 'AIzaSyBH4pIBdvgnmjzCCvO52SkcHPBv43onY70',
  authDomain: 'habit-tracker-7d4ea.firebaseapp.com',
  projectId: 'habit-tracker-7d4ea',
  storageBucket: 'habit-tracker-7d4ea.firebasestorage.app',
  messagingSenderId: '698634391870',
  appId: '1:698634391870:web:c8369a19a0f2ebedfedc6f',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || '습관 트래커', {
    body: body || '습관 알림이 도착했어요!',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    requireInteraction: true,
    vibrate: [200, 100, 200],
  })
})

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebase.initializeApp(event.data.config)
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
  }
})

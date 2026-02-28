import { useEffect, useState, useRef } from 'react'

export function useNotification() {
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const timerRefs = useRef([])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermissionStatus(result)
    return result
  }

  const clearScheduled = () => {
    timerRefs.current.forEach((id) => clearTimeout(id))
    timerRefs.current = []
  }

  const scheduleTasks = (tasks) => {
    clearScheduled()
    if (permissionStatus !== 'granted') return

    const now = new Date()
    const todayBase = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    tasks.forEach((task) => {
      if (!task.alertTime || task.completed) return

      const [hours, minutes] = task.alertTime.split(':').map(Number)
      const alertDate = new Date(todayBase)
      alertDate.setHours(hours, minutes, 0, 0)

      const delay = alertDate.getTime() - now.getTime()
      if (delay <= 0) return

      const timerId = setTimeout(() => {
        new Notification('습관 트래커', {
          body: `지금 "${task.name}" 할 시간이에요!`,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: task.id,
          renotify: true,
        })
      }, delay)

      timerRefs.current.push(timerId)
    })
  }

  useEffect(() => {
    return () => clearScheduled()
  }, [])

  return { permissionStatus, requestPermission, scheduleTasks }
}

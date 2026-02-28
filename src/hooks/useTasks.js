import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

const getTodayKey = () => new Date().toISOString().split('T')[0]

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = getTodayKey()
      const data = snapshot.docs.map((docSnap) => {
        const task = { id: docSnap.id, ...docSnap.data() }
        if (task.lastCompletedDate !== today) {
          task.completed = false
        }
        return task
      })

      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0
        const bTime = b.createdAt?.toMillis?.() ?? 0
        return aTime - bTime
      })

      setTasks(data)
      setLoading(false)
    }, (error) => {
      console.error('Firestore 오류:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const addTask = async (name, alertTime) => {
    await addDoc(collection(db, 'tasks'), {
      uid: user.uid,
      name,
      alertTime,
      completed: false,
      lastCompletedDate: null,
      createdAt: serverTimestamp(),
    })
  }

  const toggleTask = async (taskId, currentCompleted) => {
    const today = getTodayKey()
    await updateDoc(doc(db, 'tasks', taskId), {
      completed: !currentCompleted,
      lastCompletedDate: !currentCompleted ? today : null,
    })
  }

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, 'tasks', taskId))
  }

  const updateTask = async (taskId, name, alertTime) => {
    await updateDoc(doc(db, 'tasks', taskId), { name, alertTime })
  }

  return { tasks, loading, addTask, toggleTask, deleteTask, updateTask }
}

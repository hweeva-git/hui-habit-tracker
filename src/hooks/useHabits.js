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
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

export function useHabits(selectedDate) {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'habits'),
      where('uid', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0
        const bTime = b.createdAt?.toMillis?.() ?? 0
        return aTime - bTime
      })
      setHabits(data)
      setLoading(false)
    }, (error) => {
      console.error('Firestore habits 오류:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!user || !selectedDate) return

    const fetchCompletions = async () => {
      const q = query(
        collection(db, 'completions'),
        where('uid', '==', user.uid),
        where('date', '==', selectedDate)
      )
      const snapshot = await getDocs(q)
      const map = {}
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data()
        map[data.habitId] = { id: docSnap.id, completed: data.completed }
      })
      setCompletions(map)
    }

    fetchCompletions()
  }, [user, selectedDate])

  const getDayOfWeek = (dateKey) =>
    new Date(dateKey + 'T00:00:00').getDay()

  const visibleHabits = habits.filter((habit) => {
    const repeatType = habit.repeatType ?? (habit.isRecurring ? 'daily' : 'once')

    if (repeatType === 'daily') return true

    if (repeatType === 'weekly') {
      const dow = getDayOfWeek(selectedDate)
      return Array.isArray(habit.repeatDays) && habit.repeatDays.includes(dow)
    }

    // once
    const startDate = habit.startDate
      ?? (habit.createdAt?.toDate ? habit.createdAt.toDate().toISOString().split('T')[0] : null)
    return startDate === selectedDate
  })

  const habitsWithCompletion = visibleHabits.map((habit) => ({
    ...habit,
    completed: completions[habit.id]?.completed ?? false,
    completionDocId: completions[habit.id]?.id ?? null,
  }))

  const addHabit = async (name, alertTime, repeatType = 'daily', repeatDays = []) => {
    await addDoc(collection(db, 'habits'), {
      uid: user.uid,
      name,
      alertTime,
      repeatType,
      repeatDays,
      startDate: selectedDate,
      createdAt: serverTimestamp(),
    })
  }

  const addHabits = async (habitList) => {
    await Promise.all(
      habitList.map((item) =>
        addDoc(collection(db, 'habits'), {
          uid: user.uid,
          name: item.name,
          alertTime: item.alertTime || '',
          repeatType: item.repeatType ?? 'daily',
          repeatDays: item.repeatDays ?? [],
          startDate: selectedDate,
          createdAt: serverTimestamp(),
        })
      )
    )
  }

  const toggleHabit = async (habitId, completionDocId, currentCompleted) => {
    if (completionDocId) {
      await updateDoc(doc(db, 'completions', completionDocId), {
        completed: !currentCompleted,
      })
    } else {
      await addDoc(collection(db, 'completions'), {
        uid: user.uid,
        habitId,
        date: selectedDate,
        completed: true,
      })
    }
    setCompletions((prev) => ({
      ...prev,
      [habitId]: {
        id: completionDocId,
        completed: !currentCompleted,
      },
    }))
  }

  const deleteHabit = async (habitId) => {
    await deleteDoc(doc(db, 'habits', habitId))
  }

  const updateHabit = async (habitId, name, alertTime, repeatType, repeatDays) => {
    await updateDoc(doc(db, 'habits', habitId), {
      name,
      alertTime,
      repeatType,
      repeatDays: repeatDays ?? [],
    })
  }

  return {
    habits: habitsWithCompletion,
    loading,
    addHabit,
    addHabits,
    toggleHabit,
    deleteHabit,
    updateHabit,
  }
}

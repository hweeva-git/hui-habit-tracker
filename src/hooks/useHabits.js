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
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

export function useHabits(selectedDate) {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState({})
  const [loading, setLoading] = useState(true)

  // habits 실시간 구독
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

  // 선택된 날짜의 completions 로드
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

  // 선택된 날짜에 표시할 habits 필터링
  const visibleHabits = habits.filter((habit) => {
    if (habit.isRecurring) return true
    const createdDate = habit.createdAt?.toDate
      ? habit.createdAt.toDate().toISOString().split('T')[0]
      : habit.startDate
    return createdDate === selectedDate
  })

  const habitsWithCompletion = visibleHabits.map((habit) => ({
    ...habit,
    completed: completions[habit.id]?.completed ?? false,
    completionDocId: completions[habit.id]?.id ?? null,
  }))

  const addHabit = async (name, alertTime, isRecurring = true) => {
    await addDoc(collection(db, 'habits'), {
      uid: user.uid,
      name,
      alertTime,
      isRecurring,
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
          isRecurring: item.isRecurring ?? true,
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

  const updateHabit = async (habitId, name, alertTime) => {
    await updateDoc(doc(db, 'habits', habitId), { name, alertTime })
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

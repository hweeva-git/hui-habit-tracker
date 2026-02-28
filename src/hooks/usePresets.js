import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

const DEFAULT_PRESETS = [
  { name: '물 2L 마시기', emoji: '💧' },
  { name: '30분 운동', emoji: '🏃' },
  { name: '독서 30분', emoji: '📚' },
  { name: '명상 10분', emoji: '🧘' },
  { name: '일찍 일어나기', emoji: '🌅' },
  { name: '비타민 먹기', emoji: '💊' },
  { name: '일기 쓰기', emoji: '✏️' },
  { name: '스트레칭', emoji: '🤸' },
  { name: '영어 공부', emoji: '📖' },
  { name: '감사 일기', emoji: '🙏' },
]

export function usePresets() {
  const { user } = useAuth()
  const [presets, setPresets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchPresets = async () => {
      try {
        const ref = doc(db, 'userSettings', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists() && snap.data().presets) {
          setPresets(snap.data().presets)
        } else {
          await setDoc(ref, { presets: DEFAULT_PRESETS }, { merge: true })
          setPresets(DEFAULT_PRESETS)
        }
      } catch (e) {
        console.error('usePresets 로드 오류:', e)
        setPresets(DEFAULT_PRESETS)
      } finally {
        setLoading(false)
      }
    }

    fetchPresets()
  }, [user])

  const savePresets = async (newPresets) => {
    try {
      const ref = doc(db, 'userSettings', user.uid)
      await setDoc(ref, { presets: newPresets }, { merge: true })
    } catch (e) {
      console.error('usePresets 저장 오류:', e)
    }
    setPresets(newPresets)
  }

  const addPreset = async (name, emoji = '⭐') => {
    const newPresets = [...presets, { name, emoji }]
    await savePresets(newPresets)
  }

  const removePreset = async (index) => {
    const newPresets = presets.filter((_, i) => i !== index)
    await savePresets(newPresets)
  }

  return { presets, loading, addPreset, removePreset }
}

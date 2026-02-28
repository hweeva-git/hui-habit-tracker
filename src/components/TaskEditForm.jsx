import { useState } from 'react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const EMOJIS = ['💧', '🏃', '📚', '🧘', '🌅', '💊', '✏️', '🎯']

export default function TaskEditForm({ task, onUpdate, onClose }) {
  const [name, setName] = useState(task.name)
  const [emoji, setEmoji] = useState(task.emoji || EMOJIS[0])
  const [alertTime, setAlertTime] = useState(task.alertTime || '')
  const [repeatType, setRepeatType] = useState(
    task.repeatType ?? (task.isRecurring ? 'daily' : 'once')
  )
  const [repeatDays, setRepeatDays] = useState(task.repeatDays ?? [])
  const [loading, setLoading] = useState(false)

  const toggleDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (repeatType === 'weekly' && repeatDays.length === 0) return
    setLoading(true)
    await onUpdate(task.id, name.trim(), alertTime, repeatType, repeatDays, emoji)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4">습관 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <div className="flex gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex-1 text-2xl py-2 rounded-xl border-2 transition-all ${
                    emoji === e
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">습관 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              알림 시간 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="time"
              value={alertTime}
              onChange={(e) => setAlertTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">반복</label>
            <div className="flex gap-2">
              {[
                { value: 'once', label: '오늘 하루만', icon: '1️⃣' },
                { value: 'weekly', label: '특정 요일만', icon: '📅' },
                { value: 'daily', label: '매일', icon: '🔁' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeatType(opt.value)}
                  className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                    repeatType === opt.value
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-200'
                  }`}
                >
                  <span className="text-base mb-0.5">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            {repeatType === 'weekly' && (
              <div className="flex gap-1.5 mt-2">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      repeatDays.includes(i)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !name.trim() ||
                (repeatType === 'weekly' && repeatDays.length === 0)
              }
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold transition-colors"
            >
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

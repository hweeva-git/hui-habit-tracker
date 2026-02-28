import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHabits } from '../hooks/useHabits'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import { useNotification } from '../hooks/useNotification'

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS_KR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const toDateKey = (date) => date.toISOString().split('T')[0]

const formatDate = (dateKey) => {
  const d = new Date(dateKey + 'T00:00:00')
  return `${d.getFullYear()}년 ${MONTHS_KR[d.getMonth()]} ${d.getDate()}일 (${DAYS_KR[d.getDay()]})`
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const todayKey = toDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const { habits, loading, addHabit, addHabits, toggleHabit, deleteHabit, updateHabit } = useHabits(selectedDate)
  const { permissionStatus, requestPermission, scheduleTasks } = useNotification()
  const [showForm, setShowForm] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (!loading) {
      scheduleTasks(habits)
    }
  }, [habits, loading, permissionStatus])

  const isToday = selectedDate === todayKey

  const maxFutureKey = (() => {
    const d = new Date(todayKey + 'T00:00:00')
    d.setDate(d.getDate() + 14)
    return toDateKey(d)
  })()

  const isMaxFuture = selectedDate >= maxFutureKey

  const moveDate = (days) => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + days)
    const next = toDateKey(d)
    if (next > maxFutureKey) return
    setSelectedDate(next)
  }

  const completedCount = habits.filter((h) => h.completed).length
  const totalCount = habits.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="font-bold text-gray-800 text-lg">습관 트래커</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center"
            >
              {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-gray-100 z-20 min-w-48 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-800 text-sm truncate">{user.displayName || '사용자'}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex items-center justify-between">
          <button
            onClick={() => moveDate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 text-sm">{formatDate(selectedDate)}</span>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayKey)}
                className="text-xs bg-indigo-100 text-indigo-600 font-medium px-2.5 py-1 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                오늘
              </button>
            )}
          </div>

          <button
            onClick={() => moveDate(1)}
            disabled={isMaxFuture}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isMaxFuture
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white">
          <p className="text-indigo-200 text-sm">{formatDate(selectedDate)}</p>
          <p className="text-2xl font-bold mt-1">
            {totalCount === 0
              ? '습관을 추가해보세요!'
              : completedCount === totalCount
              ? '모두 완료했어요! 🎉'
              : `${completedCount}/${totalCount}개 완료`}
          </p>
          {totalCount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-indigo-200 mb-1">
                <span>진행률</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-indigo-400/40 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {permissionStatus !== 'granted' && isToday && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">알림 권한이 필요해요</p>
              <p className="text-xs text-amber-600">설정한 시간에 습관 알림을 받으려면 허용해 주세요.</p>
            </div>
            <button
              onClick={requestPermission}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex-shrink-0"
            >
              허용
            </button>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">
              {isToday ? '오늘의 습관' : '이 날의 습관'}
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              추가
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">불러오는 중...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500 font-medium">등록된 습관이 없어요</p>
              <p className="text-gray-400 text-sm mt-1">추가 버튼을 눌러 습관을 만들어보세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <TaskItem
                  key={habit.id}
                  task={habit}
                  onToggle={(habitId) => toggleHabit(habitId, habit.completionDocId, habit.completed)}
                  onDelete={deleteHabit}
                  onUpdate={updateHabit}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <TaskForm
          onAdd={addHabit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

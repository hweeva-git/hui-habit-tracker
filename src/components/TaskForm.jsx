import { useState } from 'react'

const PRESET_HABITS = [
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

export default function TaskForm({ onAdd, onAddMultiple, onClose }) {
  const [mode, setMode] = useState('preset') // 'preset' | 'custom'
  const [name, setName] = useState('')
  const [alertTime, setAlertTime] = useState('')
  const [isRecurring, setIsRecurring] = useState(true)
  const [selectedPresets, setSelectedPresets] = useState([])
  const [loading, setLoading] = useState(false)

  const togglePreset = (presetName) => {
    setSelectedPresets((prev) =>
      prev.includes(presetName)
        ? prev.filter((n) => n !== presetName)
        : [...prev, presetName]
    )
  }

  const handlePresetSubmit = async () => {
    if (selectedPresets.length === 0) return
    setLoading(true)
    await onAddMultiple(
      selectedPresets.map((name) => ({ name, alertTime: '', isRecurring }))
    )
    setLoading(false)
    onClose()
  }

  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onAdd(name.trim(), alertTime, isRecurring)
    setLoading(false)
    setName('')
    setAlertTime('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">습관 추가</h2>

          {/* 모드 탭 */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
            <button
              type="button"
              onClick={() => setMode('preset')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'preset' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
              }`}
            >
              빠른 선택
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'custom' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
              }`}
            >
              직접 입력
            </button>
          </div>

          {/* 반복 여부 공통 토글 */}
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors mb-4 ${
              isRecurring
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{isRecurring ? '🔁' : '1️⃣'}</span>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {isRecurring ? '매일 반복' : '오늘 하루만'}
                </p>
                <p className="text-xs opacity-70">
                  {isRecurring ? '모든 날짜에 표시됩니다' : '오늘 날짜에만 표시됩니다'}
                </p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-indigo-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isRecurring ? 'left-5' : 'left-1'}`} />
            </div>
          </button>
        </div>

        {/* 빠른 선택 모드 */}
        {mode === 'preset' && (
          <>
            <div className="px-6 overflow-y-auto flex-1">
              <p className="text-xs text-gray-400 mb-3">여러 개 선택 후 한 번에 추가할 수 있어요</p>
              <div className="grid grid-cols-2 gap-2 pb-4">
                {PRESET_HABITS.map((preset) => {
                  const selected = selectedPresets.includes(preset.name)
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => togglePreset(preset.name)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left ${
                        selected
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-200'
                      }`}
                    >
                      <span className="text-xl">{preset.emoji}</span>
                      <span className="text-sm font-medium leading-tight">{preset.name}</span>
                      {selected && (
                        <svg className="w-4 h-4 ml-auto flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="p-6 pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handlePresetSubmit}
                disabled={loading || selectedPresets.length === 0}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold transition-colors"
              >
                {loading ? '추가 중...' : selectedPresets.length > 0 ? `${selectedPresets.length}개 추가` : '추가하기'}
              </button>
            </div>
          </>
        )}

        {/* 직접 입력 모드 */}
        {mode === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">습관 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 물 2L 마시기"
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
                disabled={loading || !name.trim()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold transition-colors"
              >
                {loading ? '추가 중...' : '추가하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { usePresets } from '../hooks/usePresets'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const EMOJI_OPTIONS = ['⭐', '💪', '🎯', '🌟', '🔥', '✨', '🎵', '🍎', '☕', '🚶']

function RepeatSelector({ repeatType, setRepeatType, repeatDays, setRepeatDays }) {
  const toggleDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">반복</label>
      <div className="flex gap-2 mb-2">
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
  )
}

export default function TaskForm({ onAdd, onAddMultiple, onClose }) {
  const { presets, loading: presetsLoading, addPreset, removePreset } = usePresets()
  const [mode, setMode] = useState('preset')
  const [editMode, setEditMode] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetEmoji, setNewPresetEmoji] = useState('⭐')

  const [name, setName] = useState('')
  const [alertTime, setAlertTime] = useState('')
  const [repeatType, setRepeatType] = useState('daily')
  const [repeatDays, setRepeatDays] = useState([])

  const [selectedPresets, setSelectedPresets] = useState([])
  const [presetAlertTime, setPresetAlertTime] = useState('')
  const [presetRepeatType, setPresetRepeatType] = useState('daily')
  const [presetRepeatDays, setPresetRepeatDays] = useState([])

  const [loading, setLoading] = useState(false)

  const togglePreset = (presetName) => {
    if (editMode) return
    setSelectedPresets((prev) =>
      prev.includes(presetName)
        ? prev.filter((n) => n !== presetName)
        : [...prev, presetName]
    )
  }

  const handleAddPreset = async () => {
    if (!newPresetName.trim()) return
    await addPreset(newPresetName.trim(), newPresetEmoji)
    setNewPresetName('')
    setNewPresetEmoji('⭐')
  }

  const handlePresetSubmit = async () => {
    if (selectedPresets.length === 0) return
    if (presetRepeatType === 'weekly' && presetRepeatDays.length === 0) return
    setLoading(true)
    await onAddMultiple(
      selectedPresets.map((name) => ({
        name,
        alertTime: presetAlertTime,
        repeatType: presetRepeatType,
        repeatDays: presetRepeatDays,
      }))
    )
    setLoading(false)
    onClose()
  }

  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (repeatType === 'weekly' && repeatDays.length === 0) return
    setLoading(true)
    await onAdd(name.trim(), alertTime, repeatType, repeatDays)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[92vh] flex flex-col">
        <div className="p-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 mb-4">습관 추가</h2>

          <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
            <button
              type="button"
              onClick={() => { setMode('preset'); setEditMode(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'preset' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
              }`}
            >
              빠른 선택
            </button>
            <button
              type="button"
              onClick={() => { setMode('custom'); setEditMode(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'custom' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
              }`}
            >
              직접 입력
            </button>
          </div>
        </div>

        {/* 빠른 선택 모드 */}
        {mode === 'preset' && (
          <>
            <div className="px-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">
                  {editMode ? '프리셋을 편집하세요' : '여러 개 선택 후 한 번에 추가할 수 있어요'}
                </p>
                <button
                  type="button"
                  onClick={() => { setEditMode(!editMode); setSelectedPresets([]) }}
                  className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                    editMode
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {editMode ? '완료' : '편집'}
                </button>
              </div>

              {presetsLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset, idx) => {
                    const selected = selectedPresets.includes(preset.name)
                    return (
                      <div key={idx} className="relative">
                        <button
                          type="button"
                          onClick={() => togglePreset(preset.name)}
                          className={`w-full flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left ${
                            editMode
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-default'
                              : selected
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-200'
                          }`}
                        >
                          <span className="text-xl">{preset.emoji}</span>
                          <span className="text-sm font-medium leading-tight flex-1">{preset.name}</span>
                          {!editMode && selected && (
                            <svg className="w-4 h-4 flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </button>
                        {editMode && (
                          <button
                            type="button"
                            onClick={() => removePreset(idx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 새 프리셋 추가 (편집 모드) */}
              {editMode && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">새 항목 추가</p>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={newPresetEmoji}
                      onChange={(e) => setNewPresetEmoji(e.target.value)}
                      className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {EMOJI_OPTIONS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPreset()}
                      placeholder="새 습관 이름"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreset}
                      disabled={!newPresetName.trim()}
                      className="px-3 py-2 bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg text-sm font-medium"
                    >
                      추가
                    </button>
                  </div>
                </div>
              )}

              {/* 선택된 항목의 옵션 (일반 모드) */}
              {!editMode && selectedPresets.length > 0 && (
                <div className="mt-4 space-y-3 pb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      알림 시간 <span className="text-gray-400 font-normal">(선택)</span>
                    </label>
                    <input
                      type="time"
                      value={presetAlertTime}
                      onChange={(e) => setPresetAlertTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <RepeatSelector
                    repeatType={presetRepeatType}
                    setRepeatType={setPresetRepeatType}
                    repeatDays={presetRepeatDays}
                    setRepeatDays={setPresetRepeatDays}
                  />
                </div>
              )}
              <div className="h-4" />
            </div>

            <div className="p-6 pt-3 flex gap-3 flex-shrink-0 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              {!editMode && (
                <button
                  type="button"
                  onClick={handlePresetSubmit}
                  disabled={
                    loading ||
                    selectedPresets.length === 0 ||
                    (presetRepeatType === 'weekly' && presetRepeatDays.length === 0)
                  }
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-semibold transition-colors"
                >
                  {loading
                    ? '추가 중...'
                    : selectedPresets.length > 0
                    ? `${selectedPresets.length}개 추가`
                    : '추가하기'}
                </button>
              )}
            </div>
          </>
        )}

        {/* 직접 입력 모드 */}
        {mode === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="px-6 pb-6 overflow-y-auto flex-1 space-y-4">
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
            <RepeatSelector
              repeatType={repeatType}
              setRepeatType={setRepeatType}
              repeatDays={repeatDays}
              setRepeatDays={setRepeatDays}
            />
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
                {loading ? '추가 중...' : '추가하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

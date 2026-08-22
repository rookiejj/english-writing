import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'

export default function ProfileModal() {
  const { user, updateNickname, updatePassword } = useAuthStore()
  const { closeProfileModal } = useUIStore()

  const [nickname, setNickname] = useState(user?.nickname || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleNickname = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) return
    setLoading(true)
    try {
      await updateNickname(nickname)
      setMsg({ type: 'ok', text: '닉네임이 변경됐습니다' })
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(newPw)) {
      setMsg({ type: 'err', text: '새 비밀번호는 숫자 4자리여야 합니다' })
      return
    }
    setLoading(true)
    try {
      await updatePassword(currentPw, newPw)
      setMsg({ type: 'ok', text: '비밀번호가 변경됐습니다' })
      setCurrentPw('')
      setNewPw('')
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="프로필 설정" onClose={closeProfileModal}>
      <div className="flex flex-col gap-6">
        <form onSubmit={handleNickname} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">닉네임 변경</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white rounded-lg px-4 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              변경
            </button>
          </div>
        </form>

        <form onSubmit={handlePassword} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">비밀번호 변경</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="현재 비밀번호"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 tracking-widest"
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="새 비밀번호 (숫자 4자리)"
            value={newPw}
            onChange={e => setNewPw(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 tracking-widest"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            변경
          </button>
        </form>

        {msg.text && (
          <p className={`text-xs text-center ${msg.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </Modal>
  )
}

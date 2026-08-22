import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'

export default function LoginModal() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuthStore()
  const { closeLoginModal } = useUIStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(password)) {
      setError('비밀번호는 숫자 4자리여야 합니다')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        if (!nickname.trim()) { setError('닉네임을 입력해주세요'); return }
        await signup(email, password, nickname)
      }
      closeLoginModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={tab === 'login' ? '로그인' : '회원가입'} onClose={closeLoginModal}>
      <div className="flex gap-0 mb-5 border-b">
        {['login', 'signup'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError('') }}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'
            }`}
          >
            {t === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        {tab === 'signup' && (
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        )}
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="비밀번호 (숫자 4자리)"
          value={password}
          onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
          required
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 tracking-widest"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? '처리 중…' : tab === 'login' ? '로그인' : '가입하기'}
        </button>
      </form>
    </Modal>
  )
}

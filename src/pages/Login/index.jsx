import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMockProductAuth from '@/stores/mockProductAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useMockProductAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return }
    if (!pw) { setError('비밀번호를 입력해주세요.'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    login({ email: email.trim(), nickname: email.split('@')[0], level: 'B1' })
    navigate('/home', { replace: true })
  }

  const handleSocial = (provider) => {
    login({ email: `${provider}@test.com`, nickname: `${provider}user`, level: 'B1' })
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-full bg-[#f2f0eb] flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-8 px-6">
        <div className="w-14 h-14 rounded-xl bg-[#006241] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M8 28 L14 10 L20 24 L26 10 L32 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#171A20]">로그인</h2>
        <p className="text-sm text-[#8E8E8E] mt-1">계속하려면 로그인해주세요</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 space-y-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-sm text-[#171A20] placeholder-[#8E8E8E] focus:outline-none focus:border-[#006241]"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-sm text-[#171A20] placeholder-[#8E8E8E] focus:outline-none focus:border-[#006241]"
        />
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#00754A] text-white font-semibold text-sm rounded-full mt-2 disabled:opacity-60 active:scale-95 transition-transform"
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-[#8E8E8E]">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social login */}
        <div className="space-y-2">
          {[
            { provider: 'google', label: 'Google로 계속하기', bg: 'bg-white border border-gray-200', text: 'text-[#171A20]' },
            { provider: 'kakao',  label: '카카오로 계속하기', bg: 'bg-[#FEE500]', text: 'text-[#191919]' },
          ].map(({ provider, label, bg, text }) => (
            <button
              key={provider}
              type="button"
              onClick={() => handleSocial(provider)}
              className={`w-full py-3.5 rounded-full text-sm font-medium active:scale-95 transition-transform ${bg} ${text}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-6 pt-4 pb-6">
          <button type="button" className="text-xs text-[#8E8E8E] underline underline-offset-2">
            회원가입
          </button>
          <button type="button" className="text-xs text-[#8E8E8E] underline underline-offset-2">
            비밀번호 찾기
          </button>
        </div>
      </form>
    </div>
  )
}

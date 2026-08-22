import { useState } from 'react'

export default function CommentInput({ onSubmit, placeholder = '코멘트를 입력하세요…', compact = false }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      await onSubmit(text.trim())
      setText('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${compact ? '' : 'px-3 py-2 border-t'}`}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
        }}
        placeholder={placeholder}
        rows={compact ? 1 : 2}
        className="flex-1 resize-none text-sm border rounded-lg px-2 py-1.5 outline-none focus:border-gray-400"
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="self-end bg-gray-900 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-700 disabled:opacity-40 shrink-0"
      >
        등록
      </button>
    </form>
  )
}

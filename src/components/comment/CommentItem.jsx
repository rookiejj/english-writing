import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import CommentInput from './CommentInput'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() / 1000) - ts)
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

const ADMIN_EMAIL = 'rookiejj@gmail.com'

export default function CommentItem({ comment, currentUser, onDelete, onReply, onResolve, showPageLabel }) {
  const [showReply, setShowReply] = useState(false)
  const isOwn = currentUser?.id === comment.user_id
  const isAdmin = currentUser?.email === ADMIN_EMAIL
  const isResolved = !!comment.resolved

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 self-start">
          {isAdmin && (
            <input
              type="checkbox"
              checked={isResolved}
              onChange={() => onResolve?.(comment.id)}
              className="shrink-0 cursor-pointer accent-blue-500"
            />
          )}
          <Avatar nickname={comment.nickname} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-gray-800 shrink-0">{comment.nickname}</span>
            {showPageLabel && comment.page_id ? (
              <>
                <span className="text-xs text-gray-400 flex-1 truncate min-w-0">
                  {(() => { const p = comment.page_id.replace(/^https?:\/\/[^/]+/, ''); return p === '/' || p === '' ? '/home' : p })()}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{timeAgo(comment.created_at)}</span>
              </>
            ) : (
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap shrink-0">{timeAgo(comment.created_at)}</span>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap break-words" style={{ color: isResolved ? '#9CA3AF' : '#374151', textDecoration: isResolved ? 'line-through' : 'none' }}>{comment.content}</p>
          <div className="flex gap-3 mt-0.5">
            {currentUser && !showPageLabel && (
              <button
                onClick={() => setShowReply(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                답글
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-9 flex flex-col gap-2 border-l-2 border-gray-100 pl-3">
          {comment.replies.map(reply => {
            const replyResolved = !!reply.resolved
            return (
            <div key={reply.id} className="flex gap-2">
              <div className="flex items-center gap-1.5 self-start">
                {isAdmin && (
                  <input
                    type="checkbox"
                    checked={replyResolved}
                    onChange={() => onResolve?.(reply.id)}
                    className="shrink-0 cursor-pointer accent-blue-500"
                  />
                )}
                <Avatar nickname={reply.nickname} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-gray-800">{reply.nickname}</span>
                  <span className="text-xs text-gray-400 ml-auto">{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words" style={{ color: replyResolved ? '#9CA3AF' : '#374151', textDecoration: replyResolved ? 'line-through' : 'none' }}>{reply.content}</p>
                {currentUser?.id === reply.user_id && (
                  <button onClick={() => onDelete(reply.id)} className="text-xs text-red-400 hover:text-red-600 mt-0.5">
                    삭제
                  </button>
                )}
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Reply input */}
      {showReply && (
        <div className="ml-9">
          <CommentInput
            compact
            placeholder="답글을 입력하세요…"
            onSubmit={async (text) => {
              await onReply(text, comment.id)
              setShowReply(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

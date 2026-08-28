import { useEffect, useRef } from 'react'
import { useComments } from '@/hooks/useComments'
import CommentList from '@/components/comment/CommentList'
import CommentInput from '@/components/comment/CommentInput'
import LoadingState from '@/components/ui/LoadingState'
import useUIStore from '@/stores/uiStore'

export default function CommentPanel() {
  const { allComments, pageComments, loading, allLoading, user, addComment, deleteComment, resolveComment, currentPageId } = useComments()
  const { openLoginModal } = useUIStore()

  const allScrollRef = useRef(null)
  const pageScrollRef = useRef(null)

  useEffect(() => {
    if (allScrollRef.current) {
      allScrollRef.current.scrollTop = allScrollRef.current.scrollHeight
    }
  }, [allComments.length])

  useEffect(() => {
    if (!loading && pageScrollRef.current) {
      pageScrollRef.current.scrollTop = pageScrollRef.current.scrollHeight
    }
  }, [loading, pageComments.length])

  const handleReply = (text, parentId) => addComment(text, parentId)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top: All comments */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-3 py-2 border-b bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            전체 코멘트 <span className="font-normal text-gray-400">({allComments.length})</span>
          </p>
        </div>
        <div ref={allScrollRef} className="flex-1 overflow-y-auto px-3 py-3">
          {allLoading ? (
            <div className="flex justify-center py-6">
              <LoadingState label="코멘트 불러오는 중" variant="Dots" />
            </div>
          ) : (
            <CommentList
              comments={allComments}
              currentUser={user}
              onDelete={deleteComment}
              onReply={handleReply}
              onResolve={resolveComment}
              showPageLabel
              emptyText="아직 코멘트가 없습니다"
            />
          )}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Bottom: Current page comments */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-3 py-2 border-b bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            이 화면 코멘트 <span className="font-normal text-gray-400">({pageComments.length})</span>
            {currentPageId && (
              <span className="ml-1.5 font-normal text-gray-400 normal-case tracking-normal">
                {(() => { const p = currentPageId.replace(/^https?:\/\/[^/]+/, ''); return p === '/' || p === '' ? '/home' : p })()}
              </span>
            )}
          </p>
        </div>
        <div ref={pageScrollRef} className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingState label="코멘트 불러오는 중" variant="Dots" />
            </div>
          ) : (
            <CommentList
              comments={pageComments}
              currentUser={user}
              onDelete={deleteComment}
              onReply={handleReply}
              onResolve={resolveComment}
              emptyText="이 화면에 대한 코멘트가 없습니다"
            />
          )}
        </div>
        {user ? (
          <CommentInput onSubmit={(text) => addComment(text)} />
        ) : (
          <div className="px-3 py-3 border-t text-center">
            <button onClick={openLoginModal} className="text-xs text-gray-500 hover:text-gray-800 underline">
              로그인 후 코멘트를 작성할 수 있습니다
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

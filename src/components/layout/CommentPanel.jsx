import { useComments } from '@/hooks/useComments'
import CommentList from '@/components/comment/CommentList'
import CommentInput from '@/components/comment/CommentInput'
import useUIStore from '@/stores/uiStore'

export default function CommentPanel() {
  const { allComments, pageComments, loading, user, addComment, deleteComment } = useComments()
  const { openLoginModal } = useUIStore()

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
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <CommentList
            comments={allComments}
            currentUser={user}
            onDelete={deleteComment}
            onReply={handleReply}
            showPageLabel
            emptyText="아직 코멘트가 없습니다"
          />
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Bottom: Current page comments */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-3 py-2 border-b bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            이 화면 코멘트 <span className="font-normal text-gray-400">({pageComments.length})</span>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-6">불러오는 중…</p>
          ) : (
            <CommentList
              comments={pageComments}
              currentUser={user}
              onDelete={deleteComment}
              onReply={handleReply}
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

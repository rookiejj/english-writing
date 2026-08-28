import CommentItem from './CommentItem'

export default function CommentList({ comments, currentUser, onDelete, onReply, onResolve, showPageLabel = false, emptyText = '코멘트가 없습니다' }) {
  if (!comments.length) {
    return <p className="text-xs text-gray-400 text-center py-6">{emptyText}</p>
  }

  const sorted = [...comments].sort((a, b) => a.created_at - b.created_at)

  return (
    <div className="flex flex-col gap-4">
      {sorted.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          onDelete={onDelete}
          onReply={onReply}
          onResolve={onResolve}
          showPageLabel={showPageLabel}
        />
      ))}
    </div>
  )
}

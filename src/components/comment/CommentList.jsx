import CommentItem from './CommentItem'

export default function CommentList({ comments, currentUser, onDelete, onReply, showPageLabel = false, emptyText = '코멘트가 없습니다' }) {
  if (!comments.length) {
    return <p className="text-xs text-gray-400 text-center py-6">{emptyText}</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          onDelete={onDelete}
          onReply={onReply}
          showPageLabel={showPageLabel}
        />
      ))}
    </div>
  )
}

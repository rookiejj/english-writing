import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TABS = ['전체', '오늘의 영작', '질문', '공유']

const POSTS = [
  {
    id: 1, tab: '오늘의 영작',
    user: 'sunny_lee', level: 'B2', time: '2분 전',
    title: 'Work from Home — 오늘 써본 영작',
    body: 'Working from home has become increasingly common in recent years. While it offers flexibility and eliminates commuting, it can also blur the boundaries between work and personal life...',
    likes: 14, comments: 5, bookmarked: false,
  },
  {
    id: 2, tab: '질문',
    user: 'kim_english', level: 'B1', time: '15분 전',
    title: '"on the other hand" vs "however" 차이가 뭔가요?',
    body: '둘 다 "반면에, 그러나"라는 뜻인데 어떨 때 어떤 걸 써야 하는지 모르겠어요. 예문도 같이 알려주시면 좋겠어요!',
    likes: 8, comments: 12, bookmarked: true,
  },
  {
    id: 3, tab: '공유',
    user: 'writer_j', level: 'B2', time: '1시간 전',
    title: '영작에 자주 쓰는 연결어 모음 🔗',
    body: '제가 연습하면서 정리한 연결어 리스트를 공유합니다. Adding: Furthermore, Moreover / Contrasting: Nevertheless, On the other hand / Concluding: Therefore, Consequently...',
    likes: 31, comments: 7, bookmarked: false,
  },
  {
    id: 4, tab: '오늘의 영작',
    user: 'daily_writer', level: 'A2', time: '2시간 전',
    title: 'My Favorite Season 오늘 연습!',
    body: 'My favorite season is autumn because the weather is cool and the leaves change color. I usually go hiking on weekends during autumn...',
    likes: 6, comments: 2, bookmarked: false,
  },
]

const LEVEL_COLOR = { A2: 'bg-green-100 text-green-600', B1: 'bg-blue-100 text-blue-600', B2: 'bg-orange-100 text-orange-600' }

export default function Community() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('전체')
  const [liked, setLiked] = useState({})
  const [bookmarks, setBookmarks] = useState({})

  const filtered = POSTS.filter((p) => tab === '전체' || p.tab === tab)

  return (
    <div className="bg-[#f2f0eb] min-h-full">
      {/* Sticky tabs + write button */}
      <div className="sticky top-0 z-10 bg-[#f2f0eb] pt-4 pb-2 px-5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-[#171A20]">커뮤니티</h1>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-[#00754A] text-white text-xs font-semibold rounded-full active:scale-95 transition-transform"
          >
            글쓰기
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === t ? 'bg-[#006241] text-white' : 'bg-white text-[#8E8E8E] border border-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div className="px-5 pt-3 pb-4 space-y-3">
        {filtered.map((post) => (
          <div key={post.id} className="bg-white rounded-xl px-4 py-4 shadow-card">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#006241] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {post.user[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#171A20]">{post.user}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${LEVEL_COLOR[post.level] ?? 'bg-gray-100 text-gray-500'}`}>{post.level}</span>
              <span className="text-[10px] text-[#8E8E8E] ml-auto">{post.time}</span>
            </div>

            {/* Content */}
            <p className="text-sm font-semibold text-[#171A20] mb-1">{post.title}</p>
            <p className="text-xs text-[#8E8E8E] leading-relaxed line-clamp-2">{post.body}</p>

            {/* Category badge */}
            <span className="mt-2 inline-block text-[10px] bg-gray-100 text-[#8E8E8E] px-2 py-0.5 rounded-full">{post.tab}</span>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
              <button
                onClick={() => setLiked((l) => ({ ...l, [post.id]: !l[post.id] }))}
                className="flex items-center gap-1.5 text-xs text-[#8E8E8E] active:scale-95 transition-transform"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={liked[post.id] ? '#006241' : 'none'} stroke={liked[post.id] ? '#006241' : '#9ca3af'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {post.likes + (liked[post.id] ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#8E8E8E]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {post.comments}
              </button>
              <button
                onClick={() => setBookmarks((b) => ({ ...b, [post.id]: !b[post.id] }))}
                className="ml-auto flex items-center gap-1.5 text-xs text-[#8E8E8E] active:scale-95 transition-transform"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarks[post.id] ?? post.bookmarked ? '#006241' : 'none'} stroke={bookmarks[post.id] ?? post.bookmarked ? '#006241' : '#9ca3af'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

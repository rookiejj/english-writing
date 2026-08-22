import TopNav from './TopNav'
import CommentPanel from './CommentPanel'
import useUIStore from '@/stores/uiStore'

export default function AppLayout({ children }) {
  const isCommentPanelOpen = useUIStore(s => s.isCommentPanelOpen)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        {/* Prototype area */}
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>

        {/* Comment panel — PC only, slides in/out */}
        <aside
          className={`
            hidden md:flex flex-col border-l border-gray-200
            transition-all duration-300 overflow-hidden
            ${isCommentPanelOpen ? 'w-[33%]' : 'w-0 border-l-0'}
          `}
        >
          <CommentPanel />
        </aside>
      </div>
    </div>
  )
}

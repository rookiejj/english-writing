import TopNav from './TopNav'
import CommentPanel from './CommentPanel'
import ChangelogView from './ChangelogView'
import FeatureDocsView from '@/components/docs/FeatureDocsView'
import useUIStore from '@/stores/uiStore'

export default function AppLayout({ children }) {
  const { isCommentPanelOpen, viewMode } = useUIStore()
  const isDocsView = viewMode === 'definition' || viewMode === 'spec'
  const isChangelog = viewMode === 'changelog'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto min-w-0">
          {(isDocsView || isChangelog) ? (
            <>
              <div className="hidden md:block h-full">
                {isDocsView ? <FeatureDocsView mode={viewMode} /> : <ChangelogView />}
              </div>
              <div className="md:hidden h-full">{children}</div>
            </>
          ) : children}
        </main>

        {/* Comment panel — prototype view only */}
        {!isDocsView && !isChangelog && (
          <aside
            className={`
              hidden md:flex flex-col border-l border-gray-200
              transition-all duration-300 overflow-hidden
              ${isCommentPanelOpen ? 'w-[33%]' : 'w-0 border-l-0'}
            `}
          >
            <CommentPanel />
          </aside>
        )}
      </div>
    </div>
  )
}

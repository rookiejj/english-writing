// shell: 'user' | 'admin' | 'none'
// 새 화면 추가: 이 배열에만 추가 + navigation.js에 라벨 등록

import LandingPage    from './LandingPage'
import Home           from './Home'
import Login          from './Login'
import LevelTest      from './LevelTest'
import Practice       from './Practice'
import PracticeSession from './PracticeSession'
import SessionResult  from './SessionResult'
import ReviewList     from './ReviewList'
import SRSReview      from './SRSReview'
import MyPage         from './MyPage'
import Settings       from './Settings'
import Community      from './Community'
import Bookmarks      from './Bookmarks'
import AdminDashboard from './AdminDashboard'
import AdminQuestions from './AdminQuestions'
import AdminScoring   from './AdminScoring'
import AdminUsers     from './AdminUsers'
import AdminStats     from './AdminStats'

export const PAGE_REGISTRY = [
  // ── standalone (no shell)
  { path: '/',                shell: 'none',  component: LandingPage },

  // ── 사용자 IA
  { path: '/home',            shell: 'user',  component: Home },
  { path: '/login',           shell: 'user',  component: Login },
  { path: '/level-test',      shell: 'user',  component: LevelTest },
  { path: '/practice',        shell: 'user',  component: Practice },
  { path: '/practice/session',shell: 'user',  component: PracticeSession },
  { path: '/practice/result', shell: 'user',  component: SessionResult },
  { path: '/review',          shell: 'user',  component: ReviewList },
  { path: '/review/srs',      shell: 'user',  component: SRSReview },
  { path: '/my',              shell: 'user',  component: MyPage },
  { path: '/my/settings',     shell: 'user',  component: Settings },
  { path: '/community',       shell: 'user',  component: Community },
  { path: '/bookmarks',       shell: 'user',  component: Bookmarks },

  // ── 관리자 IA
  { path: '/admin',           shell: 'admin', component: AdminDashboard },
  { path: '/admin/questions', shell: 'admin', component: AdminQuestions },
  { path: '/admin/scoring',   shell: 'admin', component: AdminScoring },
  { path: '/admin/users',     shell: 'admin', component: AdminUsers },
  { path: '/admin/stats',     shell: 'admin', component: AdminStats },
]

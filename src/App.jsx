import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import UserAppShell from '@/components/layout/UserAppShell'
import AdminShell from '@/components/layout/AdminShell'
import { PAGE_REGISTRY } from '@/pages/registry'

const standalone = PAGE_REGISTRY.filter((r) => r.shell === 'none')
const userRoutes  = PAGE_REGISTRY.filter((r) => r.shell === 'user')
const adminRoutes = PAGE_REGISTRY.filter((r) => r.shell === 'admin')

export default function App() {
  return (
    <Routes>
      {/* No-shell routes — rendered directly inside AppLayout */}
      {standalone.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={<AppLayout><Component /></AppLayout>}
        />
      ))}

      {/* 사용자 IA — wrapped in phone-frame shell */}
      <Route element={<AppLayout><UserAppShell /></AppLayout>}>
        {userRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>

      {/* 관리자 IA — wrapped in sidebar shell */}
      <Route element={<AppLayout><AdminShell /></AppLayout>}>
        {adminRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

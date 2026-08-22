import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { PAGE_REGISTRY } from '@/pages/registry'

export default function App() {
  return (
    <Routes>
      {PAGE_REGISTRY.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <AppLayout>
              <Component />
            </AppLayout>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import { ConstraintsOfLifeSelector } from './pages/ConstraintsOfLifeSelector'
import { ConstraintDetailPage } from './pages/ConstraintDetailPage'

export default function App() {
  return (
    <Routes>
      {/* Constraints of Life: select area first, then data loads on detail */}
      <Route path="/" element={<ConstraintsOfLifeSelector />} />
      <Route path="/constraint/:id" element={<ConstraintDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

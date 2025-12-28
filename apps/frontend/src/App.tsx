import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import ProductDetailView from './components/ProductDetailView'
import ExploreSystems from './components/ExploreSystems'
import Layout from './components/Layout'
import MasterDomainRouter from './components/MasterDomainRouter'
import SystemHealth from './pages/SystemHealth'
import TierView from './pages/TierView'
import ArtifactsView from './components/ArtifactsView'
import Weapons from './pages/Weapons'
import ArtifactsMode from './pages/ArtifactsMode'
import { ErrorBoundary } from './components/ErrorBoundary'
import PlaneChoice from './pages/PlaneChoice'
import KnowledgePlane from './pages/KnowledgePlane'
import SystemsPlane from './pages/SystemsPlane'
import InsightPlane from './pages/InsightPlane'
import ConfigurationPlane from './pages/ConfigurationPlane'
import LoadoutPageLoader from './components/LoadoutPageLoader'
import GuideBot from './components/GuideBot'

function App() {
  return (
    <ErrorBoundary level="app">
      <BrowserRouter>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Home - Root landing page (Choose Your Mode) */}
          <Route path="/" element={<PlaneChoice />} />
          
          {/* Alias for choose-plane */}
          <Route path="/choose-plane" element={<PlaneChoice />} />
          
          {/* Knowledge routes - read-only */}
          <Route path="/knowledge" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/laws" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/constraints" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/overview" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/meaning" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/finance" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/search" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/artifacts" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/glossary" element={
            <Layout>
              <KnowledgePlane />
            </Layout>
          } />
          <Route path="/knowledge/awareness" element={<Navigate to="/knowledge/meaning" replace />} />
          
          {/* Systems routes - executable, state-changing */}
          {/* /systems shows list view by default (no redirect) */}
          <Route path="/systems" element={
            <Layout>
              <TierView defaultViewMode={'list' as const} />
            </Layout>
          } />
          <Route path="/systems/list" element={
            <Layout>
              <TierView defaultViewMode={'list' as const} />
            </Layout>
          } />
          <Route path="/systems/tiers" element={
            <Layout>
              <TierView defaultViewMode={'tiers' as const} />
            </Layout>
          } />
          <Route path="/systems/artifacts" element={
            <Layout>
              <TierView defaultViewMode={'artifacts' as const} />
            </Layout>
          } />
          <Route path="/systems/tree" element={
            <Layout>
              <TierView defaultViewMode={'tree' as const} />
            </Layout>
          } />
          {/* Systems dashboard - accessible via direct navigation */}
          <Route path="/systems/dashboard" element={
            <Layout>
              <SystemsPlane />
            </Layout>
          } />
          
          {/* Legacy dashboard route - redirect to systems/list */}
          <Route path="/dashboard" element={<Navigate to="/systems/list" replace />} />
          
          {/* Insight routes - reflect */}
          <Route path="/insight" element={
            <Layout>
              <InsightPlane />
            </Layout>
          } />
          
          {/* Configuration routes - configure */}
          <Route path="/configuration" element={
            <Layout>
              <ConfigurationPlane />
            </Layout>
          } />
          
          {/* Shared routes - accessible from both planes */}
          {/* Redirect /explore to /tiers (default view) */}
          <Route path="/explore" element={<Navigate to="/tiers" replace />} />
          {/* Legacy /tiers/systems route - redirect to /systems/tiers */}
          <Route path="/tiers/systems" element={<Navigate to="/systems/tiers" replace />} />
          <Route path="/tiers" element={
            <Layout>
              <TierView />
            </Layout>
          } />
          {/* Artifacts route - accessible from root */}
          <Route path="/artifacts" element={
            <Layout>
              <ArtifactsView />
            </Layout>
          } />
          {/* Legacy explore view - accessible via direct navigation */}
          <Route path="/explore/all" element={
            <Layout>
              <ExploreSystems />
            </Layout>
          } />
          <Route path="/master/:domain" element={
            <Layout>
              <MasterDomainRouter />
            </Layout>
          } />
          <Route path="/master/:domain/products/:productId" element={
            <Layout>
              <ProductDetailView />
            </Layout>
          } />
          <Route path="/system-health/:systemId/:view" element={
            <Layout>
              <SystemHealth />
            </Layout>
          } />
          <Route path="/admin" element={
            <Layout>
              <Admin />
            </Layout>
          } />
          <Route path="/loadouts" element={
            <Layout>
              <LoadoutPageLoader />
            </Layout>
          } />
          {/* Root redirects to home */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          {/* Coming Soon Routes */}
          <Route path="/weapons" element={<Weapons />} />
          <Route path="/artifacts-mode" element={<ArtifactsMode />} />
        </Routes>
        <GuideBot />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import SetFirstName from './pages/SetFirstName'
import LandingPage from './pages/LandingPage'
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
import BlogsPage from './pages/BlogsPage'
import GuideBot from './components/GuideBot'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { useCacheWarming } from './hooks/useCacheWarming'

function App() {
  // Warm cache on app startup
  useCacheWarming()
  return (
    <ErrorBoundary level="app">
      <BrowserRouter>
        <Routes>
          {/* Public landing page - redirects authenticated users */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          
          {/* Auth routes - redirects authenticated users */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Set first name - after Google Sign-In when name not provided */}
          <Route path="/set-first-name" element={
            <ProtectedRoute>
              <SetFirstName />
            </ProtectedRoute>
          } />
          
          {/* Choose plane - after authentication */}
          <Route path="/choose-plane" element={
            <ProtectedRoute>
              <PlaneChoice />
            </ProtectedRoute>
          } />
          
          {/* Knowledge routes - read-only */}
          <Route path="/knowledge" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/laws" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/constraints" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/overview" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/meaning" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/finance" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/search" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/artifacts" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/glossary" element={
            <ProtectedRoute>
              <Layout>
                <KnowledgePlane />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/knowledge/awareness" element={<Navigate to="/knowledge/meaning" replace />} />
          
          {/* Systems routes - executable, state-changing */}
          {/* /systems shows list view by default (no redirect) */}
          <Route path="/systems" element={
            <ProtectedRoute>
              <Layout>
                <TierView defaultViewMode={'list' as const} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/systems/list" element={
            <ProtectedRoute>
              <Layout>
                <TierView defaultViewMode={'list' as const} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/systems/tiers" element={
            <ProtectedRoute>
              <Layout>
                <TierView defaultViewMode={'tiers' as const} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/systems/artifacts" element={
            <ProtectedRoute>
              <Layout>
                <TierView defaultViewMode={'artifacts' as const} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/systems/tree" element={
            <ProtectedRoute>
              <Layout>
                <TierView defaultViewMode={'tree' as const} />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Systems dashboard - accessible via direct navigation */}
          <Route path="/systems/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <SystemsPlane />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Legacy dashboard route - redirect to systems/list */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Navigate to="/systems/list" replace />
            </ProtectedRoute>
          } />
          
          {/* Insight routes - reflect */}
          <Route path="/insight" element={
            <ProtectedRoute>
              <Layout>
                <InsightPlane />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Configuration routes - configure */}
          <Route path="/configuration" element={
            <ProtectedRoute>
              <Layout>
                <ConfigurationPlane />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Shared routes - accessible from both planes */}
          {/* Redirect /explore to /tiers (default view) */}
          <Route path="/explore" element={
            <ProtectedRoute>
              <Navigate to="/tiers" replace />
            </ProtectedRoute>
          } />
          {/* Legacy /tiers/systems route - redirect to /systems/tiers */}
          <Route path="/tiers/systems" element={
            <ProtectedRoute>
              <Navigate to="/systems/tiers" replace />
            </ProtectedRoute>
          } />
          <Route path="/tiers" element={
            <ProtectedRoute>
              <Layout>
                <TierView />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Artifacts route - accessible from root */}
          <Route path="/artifacts" element={
            <ProtectedRoute>
              <Layout>
                <ArtifactsView />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Legacy explore view - accessible via direct navigation */}
          <Route path="/explore/all" element={
            <ProtectedRoute>
              <Layout>
                <ExploreSystems />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/master/:domain" element={
            <ProtectedRoute>
              <Layout>
                <MasterDomainRouter />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/master/:domain/products/:productId" element={
            <ProtectedRoute>
              <Layout>
                <ProductDetailView />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/system-health/:systemId/:view" element={
            <ProtectedRoute>
              <Layout>
                <SystemHealth />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/loadouts" element={
            <ProtectedRoute>
              <Layout>
                <LoadoutsLanding />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/loadouts/manage" element={
            <ProtectedRoute>
              <Layout>
                <LoadoutPageLoader />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/blogs" element={
            <ProtectedRoute>
              <BlogsPage />
            </ProtectedRoute>
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


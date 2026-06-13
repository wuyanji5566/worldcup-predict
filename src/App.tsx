import { HashRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/Spinner'
import { initAuth } from '@/store/authStore'
import { loadDeepSeekConfig } from '@/services/deepseekApi'
import { LiveDataProvider } from '@/context/LiveDataContext'

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const MatchesPage = lazy(() => import('@/pages/MatchesPage').then(m => ({ default: m.MatchesPage })))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const BracketPage = lazy(() => import('@/pages/BracketPage').then(m => ({ default: m.BracketPage })))
const GroupsPage = lazy(() => import('@/pages/GroupsPage').then(m => ({ default: m.GroupsPage })))
const PredictionsPage = lazy(() => import('@/pages/PredictionsPage').then(m => ({ default: m.PredictionsPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const RulesPage = lazy(() => import('@/pages/RulesPage').then(m => ({ default: m.RulesPage })))
const MatchDetailPage = lazy(() => import('@/pages/MatchDetailPage').then(m => ({ default: m.MatchDetailPage })))
const AnalysisPage = lazy(() => import('@/pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })))

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  useEffect(() => { initAuth(); loadDeepSeekConfig() }, [])

  return (
    <LiveDataProvider>
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* HomePage has its own full-screen layout (no sidebar) */}
          <Route path="/" element={<HomePage />} />

          {/* All other pages use the AppLayout with sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:matchId" element={<MatchDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/bracket" element={<BracketPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
    </LiveDataProvider>
  )
}

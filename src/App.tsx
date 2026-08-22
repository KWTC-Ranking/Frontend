import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import { Layout } from './routes/Layout'
import { LoginPage } from './routes/LoginPage'
import { LeaderboardPage } from './routes/LeaderboardPage'
import { ChangePasswordPage } from './routes/ChangePasswordPage'
import { PlayerListPage } from './routes/PlayerListPage'
import { PlayerDetailPage } from './routes/PlayerDetailPage'
import { PlayerEditPage } from './routes/PlayerEditPage'
import { RecordMatchPage } from './routes/RecordMatchPage'
import { MatchListPage } from './routes/MatchListPage'
import { MatchDetailPage } from './routes/MatchDetailPage'
import { MatchEditPage } from './routes/MatchEditPage'
import { AddMemberPage } from './routes/AddMemberPage'
import { AdminTierWeightsPage } from './routes/AdminTierWeightsPage'
import { AdminDataResetPage } from './routes/AdminDataResetPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LeaderboardPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />

            <Route path="players" element={<PlayerListPage />} />
            <Route path="players/:id" element={<PlayerDetailPage />} />
            <Route
              path="players/:id/edit"
              element={
                <AdminRoute>
                  <PlayerEditPage />
                </AdminRoute>
              }
            />

            <Route path="matches" element={<MatchListPage />} />
            <Route path="matches/new" element={<RecordMatchPage />} />
            <Route path="matches/:id" element={<MatchDetailPage />} />
            <Route
              path="matches/:id/edit"
              element={
                <AdminRoute>
                  <MatchEditPage />
                </AdminRoute>
              }
            />

            <Route
              path="admin/members/new"
              element={
                <AdminRoute>
                  <AddMemberPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/tier-weights"
              element={
                <AdminRoute>
                  <AdminTierWeightsPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/data-reset"
              element={
                <AdminRoute>
                  <AdminDataResetPage />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

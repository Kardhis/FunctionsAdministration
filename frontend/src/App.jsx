import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage.jsx'
import HabitsAppLayout from './features/habits/ui/HabitsAppLayout.jsx'
import HabitsOverviewPage from './features/habits/pages/HabitsOverviewPage.jsx'
import HabitsManagePage from './features/habits/pages/HabitsManagePage.jsx'
import HabitsLogPage from './features/habits/pages/HabitsLogPage.jsx'
import HabitsWeekPage from './features/habits/pages/HabitsWeekPage.jsx'
import HabitsStatsPage from './features/habits/pages/HabitsStatsPage.jsx'
import HabitsSettingsPage from './features/habits/pages/HabitsSettingsPage.jsx'
import DailyLogPage from './pages/dashboard/DailyLogPage.jsx'
import StatsPage from './pages/dashboard/StatsPage.jsx'
import CalendarPage from './pages/dashboard/CalendarPage.jsx'
import ProfilePage from './pages/dashboard/ProfilePage.jsx'
import AdminRoute from './routes/AdminRoute.jsx'
import AdminUsersPage from './pages/dashboard/AdminUsersPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="habits" element={<HabitsAppLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<HabitsOverviewPage />} />
          <Route path="manage" element={<HabitsManagePage />} />
          <Route path="log" element={<HabitsLogPage />} />
          <Route path="week" element={<HabitsWeekPage />} />
          <Route path="analytics" element={<HabitsStatsPage />} />
          <Route path="settings" element={<HabitsSettingsPage />} />
        </Route>
        <Route path="daily" element={<DailyLogPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route
        path="/private"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

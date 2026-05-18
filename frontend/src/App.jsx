import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
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
import AdminOnlyRoute from './routes/AdminOnlyRoute.jsx'
import PrivateLandingRedirect from './routes/PrivateLandingRedirect.jsx'
import AdminUsersPage from './pages/dashboard/AdminUsersPage.jsx'
import ObjectivesPage from './features/objectives/pages/ObjectivesPage.jsx'

const adminOnlyRedirect = '/dashboard/habits/overview'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
              <DashboardOverviewPage />
            </AdminOnlyRoute>
          }
        />
        <Route path="habits" element={<HabitsAppLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<HabitsOverviewPage />} />
          <Route path="objectives" element={<ObjectivesPage />} />
          <Route path="manage" element={<HabitsManagePage />} />
          <Route path="log" element={<HabitsLogPage />} />
          <Route
            path="week"
            element={
              <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
                <HabitsWeekPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
                <HabitsStatsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="settings"
            element={
              <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
                <HabitsSettingsPage />
              </AdminOnlyRoute>
            }
          />
        </Route>
        <Route
          path="daily"
          element={
            <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
              <DailyLogPage />
            </AdminOnlyRoute>
          }
        />
        <Route
          path="stats"
          element={
            <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
              <StatsPage />
            </AdminOnlyRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
              <CalendarPage />
            </AdminOnlyRoute>
          }
        />
        <Route
          path="profile"
          element={
            <AdminOnlyRoute redirectTo={adminOnlyRedirect}>
              <ProfilePage />
            </AdminOnlyRoute>
          }
        />
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
            <PrivateLandingRedirect />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

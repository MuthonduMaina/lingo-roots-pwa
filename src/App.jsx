import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoadingScreen from './components/ui/LoadingScreen'

// Lazy-loaded screens — each chunk only loads when the route is visited
const SignInScreen    = lazy(() => import('./screens/auth/SignInScreen'))
const SignUpScreen    = lazy(() => import('./screens/auth/SignUpScreen'))
const ForgotPassword  = lazy(() => import('./screens/auth/ForgotPasswordScreen'))
const OnboardingFlow  = lazy(() => import('./screens/onboarding/OnboardingFlow'))
const HomeScreen      = lazy(() => import('./screens/home/HomeScreen'))
const LessonScreen    = lazy(() => import('./screens/lesson/LessonScreen'))
const QuizScreen      = lazy(() => import('./screens/lesson/QuizScreen'))
const SettingsScreen  = lazy(() => import('./screens/settings/SettingsScreen'))

// Route guard — redirects unauthenticated users to sign-in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/sign-in" replace />
  return children
}

// Route guard — redirects authenticated users away from auth screens
function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public — auth */}
        <Route path="/sign-in"        element={<AuthRoute><SignInScreen /></AuthRoute>} />
        <Route path="/sign-up"        element={<AuthRoute><SignUpScreen /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />

        {/* Onboarding — shown after first sign-up before home */}
        <Route path="/onboarding"     element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />

        {/* App */}
        <Route path="/"               element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
        <Route path="/lesson/:id"     element={<ProtectedRoute><LessonScreen /></ProtectedRoute>} />
        <Route path="/lesson/:id/quiz" element={<ProtectedRoute><QuizScreen /></ProtectedRoute>} />
        <Route path="/settings"       element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

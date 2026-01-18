import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NewThread } from './pages/NewThread';
import { ThreadView } from './pages/ThreadView';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Redirect component that preserves query params
function RedirectWithParams({ to }: { to: string }): JSX.Element {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

// Redirect authenticated users away from login page
function LoginRoute(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/new" replace />;
  }

  return <Login />;
}

function App(): JSX.Element {
  return (
    <Routes>
      {/* Public route - Login */}
      <Route path="/login" element={<LoginRoute />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RedirectWithParams to="/new" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <NewThread />
          </ProtectedRoute>
        }
      />
      <Route
        path="/thread/:threadId"
        element={
          <ProtectedRoute>
            <ThreadView />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

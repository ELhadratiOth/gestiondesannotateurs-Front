import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/pages/LoginPage';
import Space from './components/pages/space';
import BlockOfCompos from './components/Layouts/Block-of-compos';
import Datasets from './components/pages/datasets';
import Annotators from './components/pages/annotators';
import Admins from './components/pages/admins';
import Profile from './components/pages/profile';
import Labels from './components/pages/labels';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <h1>Home</h1>
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />
        <Route
          path="/annotators"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Annotators />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admins"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Admins />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Profile />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />

        <Route
          path="/datasets"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Datasets />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />

        <Route
          path="/space"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Space />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />
        <Route
          path="/labels"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Labels />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;

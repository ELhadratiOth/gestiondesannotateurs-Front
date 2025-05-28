import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/pages/Login-page';
import Space from './components/pages/space';
import BlockOfCompos from './components/layouts/block-of-compos';
import Datasets from './components/pages/datasets';
import Annotators from './components/pages/annotators';
import Admins from './components/pages/admins';
import Profile from './components/pages/profile';
import Labels from './components/pages/labels';
import Teams from './components/pages/teams';
import ForgotPasswordPage from './components/forgot-password';
import ForgotPasswordSuccessPage from './components/success-reset';
import ResetPasswordPage from './components/reset-password';
import AnnotatePage from './components/pages/annotate';
import AdminTasks from './components/pages/admin-tasks';
import CoupleOfTextPage from './components/pages/couple-of-text';
import FooterDashboard from './components/footer-dashboard';
import AdminDashboard from './components/pages/dashboard';
import TrainPage from './components/pages/train';

import NotFound from './components/pages/not-found';
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
                <AdminDashboard />
                <FooterDashboard />
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
        />{' '}
        <Route
          path="/train"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <TrainPage />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <Teams />
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
        <Route
          path="/admin/tasks/"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <AdminTasks />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />{' '}
        <Route
          path="/annotate/:id"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <AnnotatePage />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />
        <Route
          path="/couple-of-text/:idDataset"
          element={
            <ProtectedRoute>
              <CoupleOfTextPage />
            </ProtectedRoute>
          }
        />
        {/* Public routes */}
        <Route
          path="/auth"
          element={
            user ? (
              user.role === 'ANNOTATOR' ? (
                <Navigate to="/space" replace />
              ) : user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            user ? (
              user.role === 'ANNOTATOR' ? (
                <Navigate to="/space" replace />
              ) : user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            ) : (
              <ForgotPasswordPage />
            )
          }
        />
        <Route
          path="/auth/forgot-password/success"
          element={
            user ? (
              user.role === 'ANNOTATOR' ? (
                <Navigate to="/space" replace />
              ) : user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            ) : (
              <ForgotPasswordSuccessPage />
            )
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            user ? (
              user.role === 'ANNOTATOR' ? (
                <Navigate to="/space" replace />
              ) : user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            ) : (
              <ResetPasswordPage />
            )
          }
        />
        {/* Default redirect */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'ANNOTATOR' ? (
                <Navigate to="/space" replace />
              ) : user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <BlockOfCompos>
                <NotFound />
              </BlockOfCompos>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RoleProvider, useRole, ROLES } from './context/RoleContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoveryAssistantPage } from './pages/DiscoveryAssistantPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

/**
 * Route security guard enforcing authentication and role boundary checks.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, currentRole } = useRole();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <UnauthorizedPage requiredRoles={allowedRoles} />;
  }

  return children;
};

/**
 * Root entry router directing authenticated users to dashboard and guests to login.
 */
const RootRoute = () => {
  const { isLoggedIn } = useRole();
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Entry Points */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated / Role-Aware Workspace Routes */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <DiscoveryAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discovery"
              element={
                <ProtectedRoute>
                  <DiscoveryAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/features"
              element={
                <ProtectedRoute>
                  <FeaturesPage />
                </ProtectedRoute>
              }
            />
            {/* Analytics restricted exclusively to Administrator role */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <AuditTrailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;

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
import { WorkflowRoutePage } from './pages/WorkflowRoutePage';
import { ErrorAnalysisPage } from './pages/ErrorAnalysisPage';
import { ValidationPage } from './pages/ValidationPage';
import { RiskRegisterPage } from './pages/RiskRegisterPage';
import { UserGuidePage } from './pages/UserGuidePage';
import { ComplianceChecklistPage } from './pages/ComplianceChecklistPage';

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
            {/* Analytics & Error Forensics restricted to Administrator */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/errors"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <ErrorAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/validation"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <ValidationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/risks"
              element={
                <ProtectedRoute>
                  <RiskRegisterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide"
              element={
                <ProtectedRoute>
                  <UserGuidePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compliance"
              element={
                <ProtectedRoute>
                  <ComplianceChecklistPage />
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
            {/* Direct Workflow Routes with Explicit Role Protection */}
            {/* Student Workflows */}
            <Route
              path="/pay-fees"
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <WorkflowRoutePage featureId="pay-fees" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-attendance"
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <WorkflowRoutePage featureId="view-attendance" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/download-certificate"
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <WorkflowRoutePage featureId="download-certificate" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track-admission"
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <WorkflowRoutePage featureId="track-admission" />
                </ProtectedRoute>
              }
            />

            {/* Faculty Workflows */}
            <Route
              path="/mark-attendance"
              element={
                <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
                  <WorkflowRoutePage featureId="mark-attendance" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-student-attendance"
              element={
                <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
                  <WorkflowRoutePage featureId="view-student-attendance" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-attendance"
              element={
                <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
                  <WorkflowRoutePage featureId="upload-attendance" />
                </ProtectedRoute>
              }
            />

            {/* Admin Workflows */}
            <Route
              path="/manage-admissions"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <WorkflowRoutePage featureId="manage-admissions" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-fees"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <WorkflowRoutePage featureId="manage-fees" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-certificates"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <WorkflowRoutePage featureId="generate-certificates" />
                </ProtectedRoute>
              }
            />

            {/* Dynamic workflow route fallback */}
            <Route
              path="/workflows/:featureId"
              element={
                <ProtectedRoute>
                  <WorkflowRoutePage />
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

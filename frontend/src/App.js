import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';
import VerificationPending from './pages/auth/VerificationPending';

// Lender Pages
import LenderDashboard from './pages/lender/Dashboard';
import LenderRequests from './pages/lender/Requests';
import LenderHistory from './pages/lender/History';
import LenderLoanDetails from './pages/lender/LoanDetails';

// Borrower Pages
import BorrowerDashboard from './pages/borrower/Dashboard';
import BorrowerMyLoans from './pages/borrower/MyLoans';
import BorrowerNewRequest from './pages/borrower/NewRequest';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVerifications from './pages/admin/Verifications';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Shared Pages
import Profile from './pages/shared/Profile';
import Notifications from './pages/shared/Notifications';

// Loading component
const Loading = () => (
  <div className="loading-overlay">
    <div className="spinner" style={{ width: 40, height: 40 }}></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'lender') return <Navigate to="/lender" replace />;
    if (user?.role === 'borrower') return <Navigate to="/borrower" replace />;
    return <Navigate to="/login" replace />;
  }

  // Check if onboarding is complete (except for admin and onboarding page)
  if (!user?.isOnboardingComplete && user?.role !== 'admin') {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if admin verification is pending or rejected (except for admin)
  if (user?.isOnboardingComplete && !user?.isAdminVerified && user?.role !== 'admin') {
    if (user?.verificationStatus === 'pending') {
      return <Navigate to="/verification-pending" replace />;
    }
    if (user?.verificationStatus === 'rejected') {
      return <Navigate to="/verification-pending" replace />;
    }
  }

  return children;
};

// Onboarding Route (only requires authentication, not onboarding completion)
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If already completed onboarding, check verification status
  if (user?.isOnboardingComplete && user?.verificationStatus !== 'rejected') {
    // If verification is pending, redirect to verification page
    if (!user?.isAdminVerified && user?.verificationStatus === 'pending' && user?.role !== 'admin') {
      return <Navigate to="/verification-pending" replace />;
    }
    // If verified, redirect to dashboard
    if (user?.isAdminVerified || user?.role === 'admin') {
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      if (user.role === 'lender') return <Navigate to="/lender" replace />;
      if (user.role === 'borrower') return <Navigate to="/borrower" replace />;
    }
  }
  
  // Allow rejected users to access onboarding for resubmission

  return children;
};

// Verification Pending Route
const VerificationRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding not complete, redirect to onboarding
  if (!user?.isOnboardingComplete && user?.role !== 'admin') {
    return <Navigate to="/onboarding" replace />;
  }

  // If already verified, redirect to dashboard
  if (user?.isAdminVerified || user?.verificationStatus === 'approved') {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'lender') return <Navigate to="/lender" replace />;
    if (user.role === 'borrower') return <Navigate to="/borrower" replace />;
  }

  return children;
};

// Public Route (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    if (!user?.isOnboardingComplete && user?.role !== 'admin') {
      return <Navigate to="/onboarding" replace />;
    }
    // Check verification status
    if (user?.isOnboardingComplete && !user?.isAdminVerified && user?.verificationStatus === 'pending' && user?.role !== 'admin') {
      return <Navigate to="/verification-pending" replace />;
    }
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'lender') return <Navigate to="/lender" replace />;
    if (user?.role === 'borrower') return <Navigate to="/borrower" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      </Route>

      {/* Onboarding Route */}
      <Route path="/onboarding" element={
        <OnboardingRoute>
          <Onboarding />
        </OnboardingRoute>
      } />

      {/* Verification Pending Route */}
      <Route path="/verification-pending" element={
        <VerificationRoute>
          <VerificationPending />
        </VerificationRoute>
      } />

      {/* Lender Routes */}
      <Route path="/lender" element={
        <ProtectedRoute allowedRoles={['lender']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LenderDashboard />} />
        <Route path="requests" element={<LenderRequests />} />
        <Route path="history" element={<LenderHistory />} />
        <Route path="loan/:id" element={<LenderLoanDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Borrower Routes */}
      <Route path="/borrower" element={
        <ProtectedRoute allowedRoles={['borrower']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<BorrowerDashboard />} />
        <Route path="new-request" element={<BorrowerNewRequest />} />
        <Route path="my-loans" element={<BorrowerMyLoans />} />
        <Route path="loan/:id" element={<LenderLoanDetails />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

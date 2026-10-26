import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { WorkersPage } from './pages/WorkersPage';
import { WorkerDetailPage } from './pages/WorkerDetailPage';
import { CustomerSignUpPage } from './pages/CustomerSignUpPage';
import { WorkerSignUpPage } from './pages/WorkerSignUpPage';
import { LoginPage } from './pages/LoginPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { WorkerLoginPage } from './pages/WorkerLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { WorkerProfileEdit } from './pages/WorkerProfileEdit';
import { ServiceManagementPage } from './pages/ServiceManagementPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Scroll to top on route navigation
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import { ThemeLanguageProvider } from './context/ThemeLanguageContext';

export const App: React.FC = () => {
  return (
    <ThemeLanguageProvider>
      <Router>
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<Layout />}>
          {/* 1. Home */}
          <Route index element={<HomePage />} />

          {/* 2. Find Workers */}
          <Route path="workers" element={<WorkersPage />} />

          {/* 3. Worker Details */}
          <Route path="workers/:id" element={<WorkerDetailPage />} />

          {/* 4. Customer Authentication & Registration */}
          <Route path="customer/login" element={<CustomerLoginPage />} />
          <Route path="customer/register" element={<CustomerSignUpPage />} />
          <Route path="register/customer" element={<CustomerSignUpPage />} />
          <Route path="signup/customer" element={<CustomerSignUpPage />} />

          {/* 5. Worker Authentication & Registration */}
          <Route path="worker/login" element={<WorkerLoginPage />} />
          <Route path="worker/register" element={<WorkerSignUpPage />} />
          <Route path="register/worker" element={<WorkerSignUpPage />} />
          <Route path="signup/worker" element={<WorkerSignUpPage />} />

          {/* Unified Hubs */}
          <Route path="register" element={<RegisterPage />} />
          <Route path="signup" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />

          {/* 7. Customer Dashboard */}
          <Route path="customer/dashboard" element={<CustomerDashboard />} />

          {/* 8. Worker Dashboard */}
          <Route path="worker/dashboard" element={<WorkerDashboard />} />

          {/* 9. Worker Profile Editor */}
          <Route path="worker/profile/edit" element={<WorkerProfileEdit />} />

          {/* 10. Service Management */}
          <Route path="worker/services" element={<ServiceManagementPage />} />
          <Route path="services/manage" element={<ServiceManagementPage />} />

          {/* 11. Booking Details */}
          <Route path="bookings/:id" element={<BookingDetailPage />} />

          {/* 12. Admin Governance & Regulatory Authority */}
          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  </ThemeLanguageProvider>
  );
};

export default App;

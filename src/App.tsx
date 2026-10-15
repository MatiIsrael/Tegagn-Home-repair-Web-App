import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { WorkersPage } from './pages/WorkersPage';
import { WorkerDetailPage } from './pages/WorkerDetailPage';
import { CustomerSignUpPage } from './pages/CustomerSignUpPage';
import { WorkerSignUpPage } from './pages/WorkerSignUpPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { WorkerProfileEdit } from './pages/WorkerProfileEdit';
import { ServiceManagementPage } from './pages/ServiceManagementPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { AdminDashboard } from './pages/AdminDashboard';
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

export const App: React.FC = () => {
  return (
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

          {/* 4. Customer Sign Up */}
          <Route path="register/customer" element={<CustomerSignUpPage />} />
          <Route path="signup/customer" element={<CustomerSignUpPage />} />

          {/* 5. Worker Sign Up */}
          <Route path="register/worker" element={<WorkerSignUpPage />} />
          <Route path="signup/worker" element={<WorkerSignUpPage />} />

          {/* Unified Register Hub */}
          <Route path="register" element={<RegisterPage />} />
          <Route path="signup" element={<RegisterPage />} />

          {/* 6. Login */}
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

          {/* 12. Admin Dashboard */}
          <Route path="admin" element={<AdminDashboard />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Admin Components
import { AdminRouter } from './components/Admin';
import AdminDashboard from './pages/AdminDashboard';

// Practitioner Components
import PractitionerRouter from './components/Practitioner/PractitionerRouter';

// Patient Components
import PatientRouter from './components/Patient/PatientRouter';

// Landing Page
import LandingPage from './pages/LandingPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Landing Page */}
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRouter />
              </ProtectedRoute>
            } />

            {/* Practitioner Routes */}
            <Route path="/practitioner/*" element={
              <ProtectedRoute allowedRoles={['practitioner']}>
                <PractitionerRouter />
              </ProtectedRoute>
            } />

            {/* Patient Routes */}
            <Route path="/patient/*" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientRouter />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

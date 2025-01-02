import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthContext } from './context/AuthContext';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { Unauthorized } from './pages/Unauthorized';
import { HomePage } from './pages/HomePage';

export function App() {
  const { loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
        <SessionExpiredModal />
      </div>
    </BrowserRouter>
  );
}
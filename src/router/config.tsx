import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { TeacherDirectory } from '../pages/TeacherDirectory';
import { TeacherProfile } from '../pages/TeacherProfile';
import { TeacherDashboard } from '../pages/TeacherDashboard';
import { StudentDashboard } from '../pages/StudentDashboard';
import { StudentRequests } from '../pages/teacher/StudentRequests';
import { MyBookings } from '../pages/student/MyBookings';
import { MessagesPage } from '../pages/MessagesPage';
import { Unauthorized } from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/teachers',
        element: <TeacherDirectory />
      },
      {
        path: '/teachers/:id',
        element: <TeacherProfile />
      },
      {
        path: '/unauthorized',
        element: <Unauthorized />
      },
      {
        path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: '/messages',
        element: <ProtectedRoute><MessagesPage /></ProtectedRoute>
      },
      {
        path: '/messages/:conversationId',
        element: <ProtectedRoute><MessagesPage /></ProtectedRoute>
      },
      {
        path: '/teacher/dashboard',
        element: <ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>
      },
      {
        path: '/teacher/requests',
        element: <ProtectedRoute allowedRoles={['teacher']}><StudentRequests /></ProtectedRoute>
      },
      {
        path: '/student/dashboard',
        element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
      },
      {
        path: '/student/bookings',
        element: <ProtectedRoute allowedRoles={['student']}><MyBookings /></ProtectedRoute>
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-indigo-600 hover:text-indigo-500">
          Return to Home
        </a>
      </div>
    </div>
  );
}
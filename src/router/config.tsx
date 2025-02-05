import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Lazy load route components
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const TeacherDirectory = lazy(() => import('../pages/TeacherDirectory').then(m => ({ default: m.TeacherDirectory })));
const TeacherProfile = lazy(() => import('../pages/TeacherProfile').then(m => ({ default: m.TeacherProfile })));
const TeacherDashboard = lazy(() => import('../pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentRequests = lazy(() => import('../pages/teacher/StudentRequests').then(m => ({ default: m.StudentRequests })));
const MyBookings = lazy(() => import('../pages/student/MyBookings').then(m => ({ default: m.MyBookings })));
const MessagesPage = lazy(() => import('../pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const Unauthorized = lazy(() => import('../pages/Unauthorized').then(m => ({ default: m.Unauthorized })));

// Wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: withSuspense(ErrorPage),
    children: [
      {
        path: '/',
        element: withSuspense(HomePage)
      },
      {
        path: '/teachers',
        element: withSuspense(TeacherDirectory)
      },
      {
        path: '/teachers/:id',
        element: withSuspense(TeacherProfile)
      },
      {
        path: '/unauthorized',
        element: withSuspense(Unauthorized)
      },
      {
        path: '/profile',
        element: <ProtectedRoute>{withSuspense(ProfilePage)}</ProtectedRoute>
      },
      {
        path: '/messages',
        element: <ProtectedRoute>{withSuspense(MessagesPage)}</ProtectedRoute>
      },
      {
        path: '/messages/:conversationId',
        element: <ProtectedRoute>{withSuspense(MessagesPage)}</ProtectedRoute>
      },
      {
        path: '/teacher/dashboard',
        element: <ProtectedRoute allowedRoles={['teacher']}>{withSuspense(TeacherDashboard)}</ProtectedRoute>
      },
      {
        path: '/teacher/requests',
        element: <ProtectedRoute allowedRoles={['teacher']}>{withSuspense(StudentRequests)}</ProtectedRoute>
      },
      {
        path: '/student/dashboard',
        element: <ProtectedRoute allowedRoles={['student']}>{withSuspense(StudentDashboard)}</ProtectedRoute>
      },
      {
        path: '/student/bookings',
        element: <ProtectedRoute allowedRoles={['student']}>{withSuspense(MyBookings)}</ProtectedRoute>
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
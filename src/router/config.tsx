import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Error page component
function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a 
        href="/" 
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Return to Home
      </a>
    </div>
  );
}

// Lazy load pages with proper suspense wrapper
const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );
};

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const TeacherDirectory = lazy(() => import('../pages/TeacherDirectory'));
const TeacherProfile = lazy(() => import('../pages/TeacherProfile'));
const TeacherDashboard = lazy(() => import('../pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const StudentRequests = lazy(() => import('../pages/teacher/StudentRequests'));
const MyBookings = lazy(() => import('../pages/student/MyBookings'));
const MessagesPage = lazy(() => import('../pages/MessagesPage'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const JobBoard = lazy(() => import('../pages/JobBoard'));
const NewJobPost = lazy(() => import('../pages/NewJobPost'));
const JobPost = lazy(() => import('../pages/JobPost'));

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage)
      },
      {
        path: 'teachers',
        children: [
          {
            index: true,
            element: withSuspense(TeacherDirectory)
          },
          {
            path: ':id',
            element: withSuspense(TeacherProfile)
          }
        ]
      },
      {
        path: 'unauthorized',
        element: withSuspense(Unauthorized)
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspense(ProfilePage)}
          </ProtectedRoute>
        )
      },
      {
        path: 'messages',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                {withSuspense(MessagesPage)}
              </ProtectedRoute>
            )
          },
          {
            path: ':conversationId',
            element: (
              <ProtectedRoute>
                {withSuspense(MessagesPage)}
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: 'teacher',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={['teacher']}>
                {withSuspense(TeacherDashboard)}
              </ProtectedRoute>
            )
          },
          {
            path: 'requests',
            element: (
              <ProtectedRoute allowedRoles={['teacher']}>
                {withSuspense(StudentRequests)}
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: 'student',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                {withSuspense(StudentDashboard)}
              </ProtectedRoute>
            )
          },
          {
            path: 'bookings',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                {withSuspense(MyBookings)}
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: 'jobs',
        children: [
          {
            index: true,
            element: withSuspense(JobBoard)
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute allowedRoles={['student']}>
                {withSuspense(NewJobPost)}
              </ProtectedRoute>
            )
          },
          {
            path: ':id',
            element: withSuspense(JobPost)
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);
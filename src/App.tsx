import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/config';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAuthContext } from './context/AuthContext';

export function App() {
  const { loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <RouterProvider router={router} fallbackElement={<LoadingSpinner />} />;
}
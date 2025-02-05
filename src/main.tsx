import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { App } from './App';
import './index.css';

// Enable React concurrent features
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

// Use React.lazy for route components
root.render(
  <React.StrictMode>
    <SessionProvider>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          // Optimize toast rendering
          containerStyle={{
            top: 64,
          }}
          toastOptions={{
            // Reduce JS load by using CSS transitions
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
            },
          }}
        />
      </AuthProvider>
    </SessionProvider>
  </React.StrictMode>
);

// Enable performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  const reportWebVitals = (metric: any) => {
    console.log(metric);
  };

  reportWebVitals(window.performance);
}
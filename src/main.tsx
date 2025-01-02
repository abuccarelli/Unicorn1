import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </SessionProvider>
  </StrictMode>
);
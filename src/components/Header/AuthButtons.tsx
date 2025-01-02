import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export function AuthButtons() {
  const { user, signOut } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/${user.user_metadata.role}/dashboard`)}
          className="text-gray-600 hover:text-gray-900"
        >
          Dashboard
        </button>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden sm:flex sm:items-center sm:space-x-4">
        <button
          onClick={() => handleAuthClick('signin')}
          className="text-gray-600 hover:text-gray-900"
        >
          Sign In
        </button>
        <button
          onClick={() => handleAuthClick('signup')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign Up
        </button>
      </div>
      {showModal && (
        <AuthModal mode={authMode} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
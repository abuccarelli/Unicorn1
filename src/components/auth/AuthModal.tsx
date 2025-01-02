import React from 'react';
import { X } from 'lucide-react';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
}

export function AuthModal({ mode, onClose }: AuthModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        
        <AuthForm mode={mode} onClose={onClose} />
      </div>
    </div>
  );
}
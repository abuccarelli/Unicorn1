import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSessionContext } from '../context/SessionContext';
import { useAuthContext } from '../context/AuthContext';

export function SessionExpiredModal() {
  const [show, setShow] = useState(false);
  const { session, previouslyHadSession } = useSessionContext();
  const { signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Only show the modal if we previously had a session and now we don't
    if (!session && previouslyHadSession) {
      setShow(true);
    } else {
      setShow(false); // Hide modal if we have a session
    }
  }, [session, previouslyHadSession]);

  const handleClose = async () => {
    setShow(false);
    await signOut();
    navigate('/', { replace: true });
    window.location.reload(); // Force a full page reload to clear any stale state
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h2>
        <p className="text-gray-600 mb-6">
          Your session has expired. Please sign in again to continue.
        </p>
        
        <button
          onClick={handleClose}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
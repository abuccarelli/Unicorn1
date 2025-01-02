import React from 'react';
import { Link } from 'react-router-dom';

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="mt-4">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
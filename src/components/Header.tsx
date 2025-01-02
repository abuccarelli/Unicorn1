import React, { useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { AuthButtons } from './Header/AuthButtons';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">EduConnect</span>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">Find Teachers</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Become a Teacher</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">How it Works</a>
            <AuthButtons />
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Find Teachers</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Become a Teacher</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">How it Works</a>
            <AuthButtons />
          </div>
        </div>
      )}
    </header>
  );
}
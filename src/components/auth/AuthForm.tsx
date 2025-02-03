import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
}

export function AuthForm({ mode, onClose }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
            },
          },
        });
        if (error) throw error;
        toast.success('Registration successful! Please check your email.');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('Incorrect email or password. Please try again.');
          }
          throw error;
        }
        toast.success('Successfully signed in!');
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder={mode === 'signup' ? 'Choose a password' : 'Enter your password'}
          minLength={6}
        />
        {mode === 'signup' && (
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 6 characters long
          </p>
        )}
      </div>

      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            I am a:
          </label>
          <div className="mt-1 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value as 'student')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">Student</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="teacher"
                checked={role === 'teacher'}
                onChange={(e) => setRole(e.target.value as 'teacher')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">Teacher</span>
            </label>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
}
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header/index';
import { Footer } from './Footer';
import { SessionExpiredModal } from './SessionExpiredModal';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-16 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
      <SessionExpiredModal />
    </div>
  );
}